import React from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';

export const ProgressBar = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;
    
    return (
        <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Pregunta {currentStep} de {totalSteps}</Text>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        marginBottom: 20,
    },
    progressText: {
        fontSize: 12,
        color: "#666",
        marginBottom: 5,
    },
    progressBar: {
        height: 4,
        backgroundColor: "#E0E0E0",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#007AFF",
        borderRadius: 2,
    },
});