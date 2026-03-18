// ============================================================
// PANTALLA DE GRUPOS
// ============================================================
// Lista de grupos disponibles en tu tier.
// Podés unirte a grupos existentes o crear uno nuevo.
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { getGroups, createGroup, joinGroup } from '../services/chat';
import { Group } from '../utils/types';
import GroupItem from '../components/GroupItem';

export default function GroupsScreen({ navigation }: any) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  async function loadGroups() {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'El nombre del grupo es obligatorio');
      return;
    }

    setCreating(true);
    try {
      await createGroup(newGroupName.trim(), newGroupDescription.trim());
      setShowModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      loadGroups();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al crear grupo');
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinGroup(groupId: string) {
    try {
      await joinGroup(groupId);
      loadGroups();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al unirse');
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón crear grupo */}
      <TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={styles.createButtonText}>Crear Grupo</Text>
      </TouchableOpacity>

      {/* Lista de grupos */}
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyText}>No hay grupos en tu tier</Text>
          <Text style={styles.emptySubtext}>Sé el primero en crear uno</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupItem
              group={item}
              onPress={() =>
                navigation.navigate('GroupChat', {
                  groupId: item.id,
                  groupName: item.name,
                })
              }
              onJoin={() => handleJoinGroup(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadGroups();
              }}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal para crear grupo */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Grupo</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre del grupo"
              placeholderTextColor={COLORS.textSecondary}
              value={newGroupName}
              onChangeText={setNewGroupName}
              maxLength={100}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Descripción (opcional)"
              placeholderTextColor={COLORS.textSecondary}
              value={newGroupDescription}
              onChangeText={setNewGroupDescription}
              multiline
              maxLength={500}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalCreateButton, creating && { opacity: 0.6 }]}
                onPress={handleCreateGroup}
                disabled={creating}
              >
                <Text style={styles.modalCreateText}>
                  {creating ? 'Creando...' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: 16,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalCreateButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  modalCreateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
