import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';

export default function TerminosModal({ isVisible, onClose }) {
    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>TÉRMINOS Y CONDICIONES</Text>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.paragraph}>
                            <Text style={styles.subtitle}>1. ACEPTACIÓN DE LOS TÉRMINOS {"\n\n"}</Text>

                            Al acceder, registrarse y utilizar el presente aplicativo móvil, el usuario declara haber leído, entendido y aceptado de manera libre, previa, expresa e informada los presentes Términos y Condiciones, así como la Política de Tratamiento de Datos Personales.{"\n\n"}

                            <Text style={styles.subtitle}>2. OBJETO DEL APLICATIVO {"\n\n"}</Text>

                            El aplicativo tiene como finalidad gestionar el registro de asistencia de usuarios en espacios públicos o privados mediante tecnología de reconocimiento facial, permitiendo la validación de identidad de manera automatizada.{"\n\n"}

                            <Text style={styles.subtitle}>3. AUTORIZACIÓN PARA EL TRATAMIENTO DE DATOS PERSONALES {"\n\n"}</Text>

                            El usuario autoriza de manera previa, expresa e informada al responsable del aplicativo para recolectar, almacenar, usar, procesar y suprimir sus datos personales, conforme a lo establecido en la legislación colombiana vigente.{"\n\n"}

                            <Text style={styles.subtitle}>4. TRATAMIENTO DE DATOS SENSIBLES (BIOMÉTRICOS) {"\n\n"}</Text>

                            El usuario autoriza expresamente el tratamiento de sus datos biométricos (imagen facial), los cuales son considerados datos sensibles, con las siguientes finalidades:{"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}4.1 Validar la identidad del usuario.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}4.2 Registrar su asistencia en los lugares autorizados.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}4.3 Prevenir suplantaciones o fraudes.{"\n\n"}

                            El usuario reconoce que no está obligado a autorizar el tratamiento de datos sensibles; sin embargo, entiende que la negativa puede impedir el uso del aplicativo.{"\n\n"}

                            <Text style={styles.subtitle}>5. FINALIDAD DEL TRATAMIENTO DE LOS DATOS {"\n\n"}</Text>

                            Los datos personales recolectados serán utilizados para:{"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}5.1 Registro y control de asistencia.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}5.2 Identificación del usuario.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}5.3 Seguridad y control de acceso.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}5.4 Cumplimiento de obligaciones legales.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}5.5 Mejora del servicio.{"\n\n"}

                            <Text style={styles.subtitle}>6. DERECHOS DEL TITULAR DE LOS DATOS {"\n\n"}</Text>

                            El usuario, como titular de los datos personales, tiene derecho a:{"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}6.1 Conocer, actualizar y rectificar sus datos.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}6.2 Solicitar prueba de la autorización otorgada.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}6.3 Ser informado sobre el uso de sus datos.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}6.4 Revocar la autorización y/o solicitar la supresión de sus datos.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}6.5 Acceder de forma gratuita a sus datos personales.{"\n\n"}

                            Para ejercer estos derechos, el usuario podrá comunicarse a través de los canales establecidos por el aplicativo.{"\n\n"}

                            <Text style={styles.subtitle}>7. ALMACENAMIENTO Y SEGURIDAD DE LA INFORMACIÓN {"\n\n"}</Text>

                            Los datos personales serán almacenados por el tiempo necesario para cumplir con las finalidades descritas o conforme a las disposiciones legales aplicables.{"\n\n"}
                            El aplicativo implementará medidas de seguridad técnicas, humanas y administrativas para proteger la información contra acceso no autorizado, pérdida, uso indebido o fraude.{"\n\n"}

                            <Text style={styles.subtitle}>8. TRANSFERENCIA Y TRANSMISIÓN DE DATOS {"\n\n"}</Text>

                            El usuario autoriza que sus datos personales puedan ser compartidos con terceros encargados del tratamiento, únicamente cuando sea necesario para el funcionamiento del aplicativo o por requerimiento legal, garantizando en todo caso la protección de la información.{"\n\n"}

                            <Text style={styles.subtitle}>9. RESPONSABILIDADES DEL USUARIO {"\n\n"}</Text>

                            El usuario se compromete a:{"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}9.1 Proporcionar información veraz y actualizada.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}9.2 Hacer uso adecuado del aplicativo.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}9.3 No suplantar la identidad de terceros.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}9.4 Cumplir con las normas aplicables en el uso del servicio.{"\n\n"}

                            <Text style={styles.subtitle}>10. LIMITACIÓN DE RESPONSABILIDAD {"\n\n"}</Text>

                            El aplicativo no será responsable por:{"\n\n"}

                            {'\u00A0\u00A0\u00A0\u00A0'}10.1 Fallas técnicas ajenas a su control.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}10.2 Uso indebido del sistema por parte del usuario.{"\n\n"}
                            {'\u00A0\u00A0\u00A0\u00A0'}10.3 Accesos no autorizados derivados de negligencia del usuario.{"\n\n"}

                            <Text style={styles.subtitle}>11. MODIFICACIONES {"\n\n"}</Text>

                            El aplicativo se reserva el derecho de modificar en cualquier momento los presentes Términos y Condiciones. Las modificaciones serán informadas oportunamente a los usuarios.{"\n\n"}

                            <Text style={styles.subtitle}>12. LEGISLACIÓN APLICABLE {"\n\n"}</Text>

                            Los presentes Términos y Condiciones se rigen por las leyes de la República de Colombia, en especial por la Ley 1581 de 2012 y sus decretos reglamentarios.{"\n\n"}

                            <Text style={styles.subtitle}>13. ACEPTACIÓN FINAL {"\n\n"}</Text>

                            El usuario declara que ha leído, comprendido y aceptado la totalidad de los presentes Términos y Condiciones, así como la Política de Tratamiento de Datos Personales, autorizando el uso de sus datos conforme a lo aquí establecido.{"\n\n"}
                        </Text>
                    </ScrollView>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0B5FA5',
        marginBottom: 16,
        textAlign: 'center',
    },
    content: {
        marginBottom: 20,
    },
    paragraph: {
        fontSize: 17,
        color: '#374151',
        marginBottom: 14,
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#118FC3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0B5FA5',
    }
});