import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Modal, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import Justview from "./justview";
import { Camera } from 'expo-camera';


const FileExplorer = () => {
  const [currentDirectory, setCurrentDirectory] = useState(`${FileSystem.documentDirectory}`);
  const [files, setFiles] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [selectedFileModalVisible, setSelectedFileModalVisible] = useState(false);
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [createFileModalVisible, setCreateFileModalVisible] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [cameraRef, setCameraRef] = useState(null);

  useEffect(() => {
    listFiles(currentDirectory);
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, [currentDirectory]);

  const listFiles = async (directory) => {
    try {
      const result = await FileSystem.readDirectoryAsync(directory);
      if (result && result.length > 0) {
        const filesInfo = await Promise.all(result.map(async (file) => {
          try {
            const fileInfo = await FileSystem.getInfoAsync(`${directory}${file}`);
            return {
              name: file,
              isDirectory: fileInfo.isDirectory,
              uri: fileInfo.uri,
              type: getFileType(file),
            };
          } catch (error) {
            //console.error(`Error getting info for file '${file}':`, error);
            return null;
          }
        }));
        const filteredFilesInfo = filesInfo.filter(fileInfo => fileInfo !== null);
        setFiles(filteredFilesInfo);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Error listing files:', error);
      Alert.alert('Error', 'Failed to list files');
      setFiles([]);
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif') {
      return 'image';
    } else if (extension === 'txt' || extension === 'json' || extension === 'xml') {
      return 'text';
    } else {
      return 'other';
    }
  };

  const navigateBack = () => {
    if (currentDirectory !== FileSystem.documentDirectory) {
      setCurrentDirectory(currentDirectory.split('/').slice(0, -2).join('/') + '/');
    }
  };

  const handleFilePress = async (file) => {
    try {
      if (file.type === 'image') {
        setSelectedFilePath(file.uri);
        setSelectedFileModalVisible(true);
      } else if (file.type === 'text') {
        const fileContent = await FileSystem.readAsStringAsync(file.uri);
        setSelectedFileContent(fileContent);
        setSelectedFilePath(file.uri);
        setSelectedFileModalVisible(true);
      } else {
        Alert.alert('Unsupported File Type', 'Cannot open this file type');
      }
    } catch (error) {
      console.error(`Error handling file '${file.name}':`, error);
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const updateFile = async () => {
    try {
      await FileSystem.writeAsStringAsync(selectedFilePath, selectedFileContent, { encoding: FileSystem.EncodingType.UTF8 });
      setSelectedFileModalVisible(false);
      setSelectedFileContent('');
      setSelectedFilePath('');
      listFiles(currentDirectory);
    } catch (error) {
      console.error('Error updating file:', error);
      Alert.alert('Error', 'Failed to update file');
    }
  };

  const handleFileLongPress = (file) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete '${file.name}'?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteFileOrFolder(file),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const deleteFileOrFolder = async (item) => {
    try {
      if (item.isDirectory) {
        await FileSystem.deleteAsync(item.uri, { idempotent: true });
      } else {
        await FileSystem.deleteAsync(item.uri);
      }
      listFiles(currentDirectory);
    } catch (error) {
      console.error(`Error deleting '${item.name}':`, error);
      Alert.alert('Error', `Failed to delete '${item.name}'`);
    }
  };

  const renderIcon = (item) => {
    if (item.isDirectory) {
      return <Ionicons name="folder-outline" size={24} color="blue" />;
    } else {
      if (item.type === 'image') {
        return <Image source={{ uri: item.uri }} style={{ width: 24, height: 24 }} />;
      } else if (item.type === 'text') {
        return <Ionicons name="document-outline" size={24} color="black" />;
      } else {
        return <Ionicons name="document" size={24} color="gray" />;
      }
    }
  };


  const takePicture = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log(result);
  
      if (!result.cancelled) {
        const uri = result.assets[0].uri;
        const fileName = uri.split('/').pop();
        const newFilePath = `${currentDirectory}${fileName}`;
  
        await FileSystem.copyAsync({ from: uri, to: newFilePath });
        listFiles(currentDirectory);
      } else {
        console.log('Image selection cancelled');
      }
    } catch (error) {
    //   console.error('Error taking picture:', error);
    //   Alert.alert('Error', 'Failed to take picture');
    }
  };

  const openCamera = async () => {
    setCameraModalVisible(true);
  };

  const handleCameraCancel = () => {
    setCameraModalVisible(false);
  };

 
  const createFolder = async () => {
    if (newFolderName.trim() === '') {
      Alert.alert('Folder name cannot be empty');
      return;
    }

    const newFolderUri = `${currentDirectory}${newFolderName}/`;
    try {
      await FileSystem.makeDirectoryAsync(newFolderUri);
      setNewFolderName('');
      setCreateFolderModalVisible(false);
      listFiles(currentDirectory);
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Error', 'Failed to create folder');
    }
  };

  const createFile = async () => {
    if (newFileName.trim() === '') {
      Alert.alert('File name cannot be empty');
      return;
    }
    const newFileUri = `${currentDirectory}${newFileName}.txt`;
    try {
      await FileSystem.writeAsStringAsync(newFileUri, 'File content goes here', { encoding: FileSystem.EncodingType.UTF8 });
      setNewFileName('');
      setCreateFileModalVisible(false);
      listFiles(currentDirectory);
    } catch (error) {
      console.error('Error creating file:', error);
      Alert.alert('Error', 'Failed to create file');
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={navigateBack} style={[styles.backRoundButton, styles.backButton]}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.header}>{currentDirectory}</Text>
      </View>

      <FlatList
        data={files}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => item.isDirectory ? setCurrentDirectory(item.uri + '/') : handleFilePress(item)} onLongPress={() => handleFileLongPress(item)}>
            <View style={styles.itemContainer}>
              {renderIcon(item)}
              <Text style={styles.item}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.name}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.roundButton, styles.createFolderButton]} onPress={() => setCreateFolderModalVisible(true)}>
          <Ionicons name="folder-outline" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.roundButton, styles.createFileButton]} onPress={() => setCreateFileModalVisible(true)}>
          <Ionicons name="document-outline" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.roundButton, styles.uploadButton]} onPress={takePicture}>
          <Ionicons name="cloud-upload-outline" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.roundButton, styles.cameraButton]} onPress={openCamera}>
          <Ionicons name="camera-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedFileModalVisible}
        onRequestClose={() => setSelectedFileModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.fileModalContent}>
            {selectedFilePath && (
              <>
                {getFileType(selectedFilePath) === 'image' && (
                  <Image source={{ uri: selectedFilePath }} style={{ width: '100%', height: 300, resizeMode: 'contain' }} />
                )}
                {getFileType(selectedFilePath) === 'text' && (
                  <TextInput
                    style={styles.fileContentInput}
                    multiline={true}
                    value={selectedFileContent}
                    onChangeText={text => setSelectedFileContent(text)}
                  />
                )}
              </>
            )}
            <TouchableOpacity style={styles.modalButton} onPress={updateFile}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>

            <Pressable style={[styles.modalButton, styles.closeButton]} onPress={() => setSelectedFileModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={createFolderModalVisible}
        onRequestClose={() => setCreateFolderModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="New folder name"
              onChangeText={text => setNewFolderName(text)}
              value={newFolderName}
            />
            <TouchableOpacity style={styles.modalButton} onPress={createFolder}>
              <Text style={styles.buttonText}>Create Folder</Text>
            </TouchableOpacity>

            <Pressable style={[styles.modalButton, styles.closeButton]} onPress={() => setCreateFolderModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={createFileModalVisible}
        onRequestClose={() => setCreateFileModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="New file name"
              onChangeText={text => setNewFileName(text)}
              value={newFileName}
            />
            <TouchableOpacity style={styles.modalButton} onPress={createFile}>
              <Text style={styles.buttonText}>Create File</Text>
            </TouchableOpacity>

            <Pressable style={[styles.modalButton, styles.closeButton]} onPress={() => setCreateFileModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
  animationType="slide"
  transparent={false}
  visible={cameraModalVisible}
  onRequestClose={() => setCameraModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.cameraContent}>
      {hasCameraPermission === null ? (
        <Text>Requesting for camera permission</Text>
      ) : hasCameraPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
       <View style={{flex:1,width:500}}><Justview/></View>
     )}
    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1E90FF',
  },
  header: {
    flex: 1,
    fontSize: 20,
    color: 'white',
  },
  backRoundButton: {
    marginRight: 10,
  },
  roundButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E90FF',
    margin: 10,
  },
  createFolderButton: {
    backgroundColor: '#4CAF50',
  },
  createFileButton: {
    backgroundColor: '#FF5722',
  },
  uploadButton: {
    backgroundColor: '#FFA000',
  },
  cameraButton: {
    backgroundColor: '#9C27B0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  item: {
    marginLeft: 10,
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  fileModalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  fileContentInput: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  cameraContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
    justifyContent: 'space-between',
  },
  cameraButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  cameraButtonText: {
    fontSize: 18,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 10,
  },

  //late camera styles

  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },});

export default FileExplorer;
