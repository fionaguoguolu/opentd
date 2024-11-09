import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs';

// Constants
const GRID_SIZE = 12;
const TILE_SIZE = 50;
const saveDirectory = `${RNFS.DocumentDirectoryPath}/maps`;

// Cell Types
type CellType = 'wall' | 'path';
type GridType = CellType[][];

const TowerDefenseMapEditor: React.FC = () => {
  const [grid, setGrid] = useState<GridType>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('wall'))
  );

  // Toggle cell between 'wall' and 'path'
  const toggleCell = (row: number, col: number) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = prevGrid[row][col] === 'wall' ? 'path' : 'wall';
      return newGrid;
    });
  };

  // Save the grid to a file
  const saveGrid = async () => {
    const filename = `map_${Date.now()}.txt`;
    const filePath = `${saveDirectory}/${filename}`;
    const gridData = grid.map(row => row.join('')).join('\n');

    try {
      const dirExists = await RNFS.exists(saveDirectory);
      if (!dirExists) {
        await RNFS.mkdir(saveDirectory);
      }
      await RNFS.writeFile(filePath, gridData, 'utf8');
      Alert.alert("Grid Saved", `File saved to: ${filePath}`);
      console.log(`File saved to: ${filePath}`);
    } catch (error) {
      console.error("Failed to save file:", error);
      Alert.alert("Save Error", "Failed to save grid data.");
    }
  };

  // Load a grid from a selected file
  const loadGrid = async () => {
    try {
      const dirExists = await RNFS.exists(saveDirectory);
      if (!dirExists) {
        Alert.alert("No Saved Maps", "No saved map files found.");
        return;
      }

      const files = await RNFS.readDir(saveDirectory);
      const mapFiles = files.filter(file => file.isFile() && file.name.endsWith('.txt'));

      if (mapFiles.length === 0) {
        Alert.alert("No Saved Maps", "No saved map files found.");
        return;
      }

      const fileNames = mapFiles.map(file => file.name);
      Alert.alert(
        "Load Map",
        "Select a map to load:",
        fileNames.map(fileName => ({
          text: fileName,
          onPress: () => loadSelectedMap(fileName),
        })),
      );
    } catch (error) {
      console.error("Failed to load files:", error);
      Alert.alert("Load Error", "Failed to load saved maps.");
    }
  };

  // Read and load the selected map file into the grid
  const loadSelectedMap = async (fileName: string) => {
    const filePath = `${saveDirectory}/${fileName}`;
    try {
      const fileContents = await RNFS.readFile(filePath, 'utf8');
      const loadedGrid = fileContents
        .trim()
        .split('\n')
        .map(row => row.split('') as CellType[]);

      setGrid(loadedGrid);
      Alert.alert("Map Loaded", `Loaded map from ${fileName}`);
    } catch (error) {
      console.error("Failed to read file:", error);
      Alert.alert("Load Error", `Failed to load map: ${fileName}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Tap on a cell to toggle between wall and path.</Text>
      <View style={styles.grid}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <TouchableOpacity
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.cell,
                { backgroundColor: cell === 'path' ? 'yellow' : 'green' },
              ]}
              onPress={() => toggleCell(rowIndex, colIndex)}
            />
          ))
        )}
      </View>
      <Button title="Save Map" onPress={saveGrid} />
      <Button title="Load Map" onPress={loadGrid} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  instructions: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: GRID_SIZE * TILE_SIZE,
  },
  cell: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderWidth: 1,
    borderColor: 'black',
  },
});

export default TowerDefenseMapEditor;
