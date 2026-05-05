import React, {useState, useEffect} from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    StyleSheet,
} from 'react-native';
import {useTheme} from '../components/common/ThemeContext';
import PrimaryButton from '../components/auth/PrimaryButton';
import BottomBar from '../components/common/NavigationBar';
import CustomTabs from '../components/common/CustomTabs';
import {useManageUsersViewModel} from '../../viewmodels/useManageUsersViewModel';

export default function ManageUsersScreen({navigation, userRole, onLogout}) {
    const {colors} = useTheme();
    const {
        allStudents,
        students,
        teachers,
        searchStudents,
        addStudentById,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
    } = useManageUsersViewModel();

    const [tab, setTab] = useState('students'); // 'students' | 'teachers'
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState(null); // 'edit' | 'searchAdd'
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({nombre: '', email: '', grado: '', telefono: '', materia: ''});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (userRole && userRole !== 'Administrador') {
            Alert.alert('Acceso denegado', 'Solo administradores pueden acceder a esta pantalla.');
            navigation.goBack();
        }
    }, [userRole, navigation]);

    const openAdd = () => {
        // Agregar estudiante mediante búsqueda
        setEditing(null);
        setForm({nombre: '', email: '', grado: '', telefono: '', materia: ''});
        setSearchQuery('');
        setSearchResults([]);
        setModalMode('searchAdd');
        setModalVisible(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({...item});
        setModalMode('edit');
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!form.nombre) {
            Alert.alert('Validación', 'El nombre es obligatorio');
            return;
        }

        if (modalMode === 'edit') {
            if (tab === 'students') {
                updateStudent({...editing, ...form});
            } else {
                updateTeacher({...editing, ...form});
            }
        }

        setModalVisible(false);
        setModalMode(null);
    };

    const confirmDelete = (id) => {
        Alert.alert('Confirmar', '¿Eliminar registro?', [
            {text: 'Cancelar', style: 'cancel'},
            {
                text: 'Eliminar', style: 'destructive', onPress: () => {
                    if (tab === 'students') deleteStudent(id);
                    else deleteTeacher(id);
                }
            },
        ]);
    };

    const renderItem = ({item}) => (
        <View style={[styles.item, {backgroundColor: colors.card}]}>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, {color: colors.text}]}>{item.nombre}</Text>
                <Text style={[styles.itemMeta, {color: colors.textSecondary}]}>
                    {tab === 'students' ? `${item.grado || ''} • ${item.email || ''}` : `${item.materia || ''} • ${item.email || ''}`}
                </Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openEdit(item)}>
                    <Text style={[styles.actionText, {color: colors.primary}]}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => confirmDelete(item.id)}>
                    <Text style={[styles.actionText, {color: '#E53935'}]}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={styles.header}>
                <Text style={[styles.title, {color: colors.text}]}>Gestión de Usuarios</Text>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tabButton, tab === 'students' && {
                        borderBottomColor: colors.primary,
                        borderBottomWidth: 2
                    }]}
                    onPress={() => setTab('students')}
                >
                    <Text style={{color: colors.text}}>Estudiantes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, tab === 'teachers' && {
                        borderBottomColor: colors.primary,
                        borderBottomWidth: 2
                    }]}
                    onPress={() => setTab('teachers')}
                >
                    <Text style={{color: colors.text}}>Profesores</Text>
                </TouchableOpacity>
            </View>

            <CustomTabs userRole={userRole} onLogout={onLogout} />

            <View style={styles.actionsRow}>
                {tab === 'students' && (
                    <PrimaryButton title={'Agregar estudiante'} onPress={openAdd} />
                )}
            </View>

            <FlatList
                data={tab === 'students' ? students : teachers}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <View style={styles.empty}><Text style={{color: colors.textSecondary}}>Sin registros</Text></View>
                )}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalWrapper}>
                    <View style={[styles.modal, {backgroundColor: colors.card}]}> 
                        {modalMode === 'searchAdd' ? (
                            <>
                                <Text style={[styles.modalTitle, {color: colors.text}]}>Buscar estudiante</Text>
                                <TextInput
                                    placeholder="Ingrese nombre del estudiante"
                                    placeholderTextColor={colors.textSecondary}
                                    style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                                    value={searchQuery}
                                    onChangeText={(text) => {
                                        setSearchQuery(text);
                                        const results = searchStudents(text);
                                        setSearchResults(results);
                                    }}
                                />

                                <FlatList
                                    data={searchResults}
                                    keyExtractor={item => item.id}
                                    renderItem={({item}) => (
                                        <View style={[styles.searchItem, {borderColor: colors.border}]}> 
                                            <View style={{flex:1}}>
                                                <Text style={{color: colors.text, fontWeight: '600'}}>{item.nombre}</Text>
                                                <Text style={{color: colors.textSecondary}}>{item.grado} • {item.email}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => {
                                                addStudentById(item.id);
                                                setModalVisible(false);
                                                setModalMode(null);
                                            }}>
                                                <Text style={{color: colors.primary}}>Agregar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    ListEmptyComponent={() => (
                                        <View style={{padding: 12}}><Text style={{color: colors.textSecondary}}>Ingrese un nombre para buscar</Text></View>
                                    )}
                                />

                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={[styles.cancelButton, {borderColor: colors.border}]} onPress={() => {setModalVisible(false); setModalMode(null);}}>
                                        <Text style={{color: colors.textSecondary}}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.modalTitle, {color: colors.text}]}>{editing ? 'Editar' : 'Nuevo registro'}</Text>

                                <TextInput
                                    placeholder="Nombre"
                                    placeholderTextColor={colors.textSecondary}
                                    style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                                    value={form.nombre}
                                    onChangeText={(text) => setForm(f => ({...f, nombre: text}))}
                                />
                                <TextInput
                                    placeholder="Email"
                                    placeholderTextColor={colors.textSecondary}
                                    style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                                    value={form.email}
                                    onChangeText={(text) => setForm(f => ({...f, email: text}))}
                                    keyboardType="email-address"
                                />

                                {tab === 'students' ? (
                                    <>
                                        <TextInput
                                            placeholder="Grado"
                                            placeholderTextColor={colors.textSecondary}
                                            style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                                            value={form.grado}
                                            onChangeText={(text) => setForm(f => ({...f, grado: text}))}
                                        />
                                        <TextInput
                                            placeholder="Teléfono"
                                            placeholderTextColor={colors.textSecondary}
                                            style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                                            value={form.telefono}
                                            onChangeText={(text) => setForm(f => ({...f, telefono: text}))}
                                            keyboardType="phone-pad"
                                        />
                                    </>
                                ) : (
                                    <TextInput
                                        placeholder="Materia"
                                        placeholderTextColor={colors.textSecondary}
                                        style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                                        value={form.materia}
                                        onChangeText={(text) => setForm(f => ({...f, materia: text}))}
                                    />
                                )}

                                <View style={styles.modalActions}>
                                    <PrimaryButton title="Guardar" onPress={handleSave} />
                                    <TouchableOpacity style={[styles.cancelButton, {borderColor: colors.border}]} onPress={() => {setModalVisible(false); setModalMode(null);}}>
                                        <Text style={{color: colors.textSecondary}}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <BottomBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    header: {padding: 16},
    title: {fontSize: 20, fontWeight: '700'},
    tabs: {flexDirection: 'row', paddingHorizontal: 16},
    tabButton: {flex: 1, paddingVertical: 12, alignItems: 'center'},
    actionsRow: {padding: 16},
    list: {paddingHorizontal: 16, paddingBottom: 40},
    item: {flexDirection: 'row', padding: 12, borderRadius: 8, marginBottom: 10, alignItems: 'center'},
    itemInfo: {flex: 1},
    itemName: {fontSize: 16, fontWeight: '600'},
    itemMeta: {fontSize: 12, marginTop: 4},
    itemActions: {flexDirection: 'row'},
    actionButton: {marginLeft: 12},
    actionText: {fontSize: 14},
    empty: {padding: 30, alignItems: 'center'},

    modalWrapper: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)'},
    modal: {width: '90%', borderRadius: 8, padding: 16},
    modalTitle: {fontSize: 18, fontWeight: '700', marginBottom: 12},
    input: {borderWidth: 1, borderRadius: 6, padding: 10, marginBottom: 10},
    modalActions: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8},
    cancelButton: {padding: 10, borderWidth: 1, borderRadius: 6, alignItems: 'center'},
    searchItem: {flexDirection: 'row', padding: 10, borderWidth: 1, borderRadius: 6, marginBottom: 8, alignItems: 'center'},
});
