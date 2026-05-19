package com.example.notes.viewmodel

import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.ViewModel
import com.example.notes.model.Note

class NotesViewModel : ViewModel() {
    private val _notes = mutableStateListOf<Note>(
        Note(title = "Welcome!", content = "This is your first note. Feel free to edit or delete it!"),
        Note(title = "Shopping List", content = "1. Milk\n2. Eggs\n3. Bread")
    )
    val notes: List<Note> get() = _notes

    fun addNote(title: String, content: String) {
        _notes.add(0, Note(title = title, content = content))
    }

    fun updateNote(id: String, title: String, content: String) {
        val index = _notes.indexOfFirst { it.id == id }
        if (index != -1) {
            _notes[index] = _notes[index].copy(title = title, content = content, timestamp = System.currentTimeMillis())
        }
    }

    fun deleteNote(id: String) {
        _notes.removeIf { it.id == id }
    }
}
