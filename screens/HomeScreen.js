// screens/HomeScreen.js
// Lokasi: ./screens/HomeScreen.js
// Fungsi: Layar utama untuk input tugas, filter, penyimpanan lokal, dan daftar tugas. DateTimePicker diperbarui untuk menghindari error Android.

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import TodoItem from '../components/TodoItem';

export default function HomeScreen() {
  const [task, setTask] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('all');

  // Gabungkan date dan time untuk tugas
  const dateTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes()
  );

  // Memuat tugas dari AsyncStorage saat aplikasi mulai
  useEffect(() => {
    loadTodos();
  }, []);

  // Memuat tugas dari penyimpanan lokal
  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem('todos');
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos).map(todo => ({
          ...todo,
          dateTime: new Date(todo.dateTime), // Konversi string ke Date
        })));
      }
    } catch (error) {
      console.error('Gagal memuat tugas:', error);
    }
  };

  // Menyimpan tugas ke penyimpanan lokal
  const saveTodos = async (newTodos) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(newTodos));
      setTodos(newTodos);
    } catch (error) {
      console.error('Gagal menyimpan tugas:', error);
    }
  };

  // Menambahkan atau memperbarui tugas
  const addOrUpdateTask = async () => {
    if (task.trim() === '') {
      alert('Nama tugas tidak boleh kosong!');
      return;
    }

    let newTodos;
    if (editId) {
      newTodos = todos.map((todo) =>
        todo.id === editId ? { ...todo, task, dateTime, completed: todo.completed } : todo
      );
      setEditId(null);
    } else {
      newTodos = [...todos, { id: Date.now().toString(), task, dateTime, completed: false }];
    }
    await saveTodos(newTodos);
    setTask('');
    setDate(new Date());
    setTime(new Date());
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  // Menghapus tugas
  const deleteTask = async (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    await saveTodos(newTodos);
  };

  // Mengedit tugas
  const editTask = (id, task, dateTime) => {
    setEditId(id);
    setTask(task);
    setDate(new Date(dateTime));
    setTime(new Date(dateTime));
  };

  // Menandai tugas sebagai selesai
  const toggleComplete = async (id) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    await saveTodos(newTodos);
  };

  // Memfilter tugas
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'overdue') return !todo.completed && new Date(todo.dateTime) < new Date();
    return true;
  });

  // Handler untuk DateTimePicker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Tutup di Android setelah pilih
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios'); // Tutup di Android setelah pilih
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Masukkan tugas"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {date.toLocaleDateString('id-ID', { dateStyle: 'short' })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.dateText}>
            {time.toLocaleTimeString('id-ID', { timeStyle: 'short' })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onTimeChange}
          />
        )}
        <Button
          title={editId ? 'Perbarui Tugas' : 'Tambah Tugas'}
          onPress={addOrUpdateTask}
          color="#007AFF"
        />
      </View>
      <View style={styles.filterContainer}>
        {['all', 'completed', 'overdue'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={styles.filterText}>
              {f === 'all' ? 'Semua' : f === 'completed' ? 'Selesai' : 'Terlambat'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {filteredTodos.length === 0 ? (
        <Text style={styles.emptyText}>Belum ada tugas</Text>
      ) : (
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onDelete={deleteTask}
              onEdit={editTask}
              onToggleComplete={toggleComplete}
            />
          )}
          style={styles.list}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  },
});