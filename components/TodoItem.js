// components/TodoItem.js
// Lokasi: ./components/TodoItem.js
// Fungsi: Menampilkan setiap tugas dengan status selesai dan pengingat "⚠️ Sudah Lewat" jika terlambat.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TodoItem({ todo, onDelete, onEdit, onToggleComplete }) {
  const isOverdue = !todo.completed && new Date(todo.dateTime) < new Date();

  return (
    <View style={styles.container}>
      <View style={styles.taskContainer}>
        <Text style={[styles.taskText, todo.completed && styles.completedText]}>
          {todo.task}
        </Text>
        <Text style={styles.timeText}>
          {new Date(todo.dateTime).toLocaleString('id-ID', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </Text>
        {isOverdue && <Text style={styles.overdueText}>⚠️ Sudah Lewat</Text>}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.completeButton, todo.completed && styles.completedButton]}
          onPress={() => onToggleComplete(todo.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{todo.completed ? 'Batal' : 'Selesai'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => onEdit(todo.id, todo.task, todo.dateTime)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => onDelete(todo.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  taskContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  overdueText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: 'bold',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  completedButton: {
    backgroundColor: '#E0E0E0',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});