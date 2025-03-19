import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Dimensions, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import config from "../../utils/config";
import { Svg, Circle } from "react-native-svg";
import { Picker } from '@react-native-picker/picker';

const screenWidth = Dimensions.get("window").width;

const UserForecast = () => {
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedFeature, setSelectedFeature] = useState("Temperature");

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                if (!token) throw new Error("No authentication token found.");

                const response = await axios.get(`${config.API_BASE_URL}/userforecast`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setForecastData(response.data);
            } catch (err) {
                setError(err.response?.status === 404 ? "No forecast available yet." : "Failed to fetch forecast data.");
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, []);

    const handleFeatureChange = (feature) => {
        setSelectedFeature(feature);
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading forecast data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    if (!forecastData || Object.keys(forecastData).length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <MaterialCommunityIcons name="chart-timeline-variant" size={48} color="#6366F1" />
                <Text style={styles.noData}>No forecast data available</Text>
            </View>
        );
    }

    const { total_forecasts, total_energy, total_savings, avg_peak_load, min_peak_load, max_peak_load, avg_factors, energy_by_weekday, scatter_data } = forecastData;

    const energyTrendData = Object.keys(energy_by_weekday).map((day) => ({
        name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
        energy: energy_by_weekday[day],
    }));

    const factorData = Object.keys(avg_factors).map((key, index) => ({
        name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1, 3)).join(' '), // Shortened labels
        population: avg_factors[key],
        color: [
            '#6366F1', '#EC4899', '#14B8A6', '#F59E0B',
            '#8B5CF6', '#10B981', '#3B82F6', '#EF4444'
        ][index % 8],
        legendFontColor: "#64748B",
        legendFontSize: 10,
    }));

    const scatterPlotPoints = scatter_data[selectedFeature] || [];
    const maxX = Math.max(...scatterPlotPoints.map(([x]) => x), 1);
    const maxY = Math.max(...scatterPlotPoints.map(([, y]) => y), 1);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Energy Consumption Insights</Text>

                {/* Stats Cards */}
                <View style={styles.statsGrid}>
                    <View style={styles.statsCard}>
                        <MaterialCommunityIcons name="lightning-bolt" size={24} color="#6366F1" />
                        <Text style={styles.statsLabel}>Total Energy</Text>
                        <Text style={styles.statsValue}>{total_energy} kWh</Text>
                    </View>

                    <View style={styles.statsCard}>
                        <MaterialCommunityIcons name="leaf" size={24} color="#10B981" />
                        <Text style={styles.statsLabel}>Total Savings</Text>
                        <Text style={styles.statsValue}>{total_savings} kWh</Text>
                    </View>

                    <View style={styles.statsCard}>
                        <MaterialCommunityIcons name="chart-bell-curve" size={24} color="#F59E0B" />
                        <Text style={styles.statsLabel}>Avg Peak Load</Text>
                        <Text style={styles.statsValue}>{avg_peak_load} kW</Text>
                    </View>... <View style={styles.statsCard}>
                        <MaterialCommunityIcons name="chart-box" size={24} color="#EC4899" />
                        <Text style={styles.statsLabel}>Total Forecasts</Text>
                        <Text style={styles.statsValue}>{total_forecasts}</Text>
                    </View>
                </View>

                <View style={styles.chartsContainer}>
                    {/* Line Chart Card */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Minimum Daily Energy Consumption</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <LineChart
                                data={{
                                    labels: energyTrendData.map((item) => item.name),
                                    datasets: [{ data: energyTrendData.map((item) => item.energy) }],
                                }}
                                width={Math.max(screenWidth - 48, 400)} // Minimum width of 400
                                height={220}
                                chartConfig={{
                                    ...chartConfig,
                                    propsForLabels: {
                                        fontSize: 12,
                                    },
                                }}
                                bezier
                                style={styles.chart}
                                withHorizontalLines={true}
                                withVerticalLines={false}
                                withDots={true}
                                withShadow={false}
                                segments={5}
                            />
                        </ScrollView>
                    </View>

                    {/* Pie Chart Card */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Energy Savings Distribution</Text>
                        <View style={styles.pieChartContainer}>
                            <PieChart
                                data={factorData}
                                width={screenWidth - 48}
                                height={200}
                                chartConfig={chartConfig}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="0"
                                center={[screenWidth / 4, 0]} // Adjust center position
                                absolute
                                style={styles.chart}
                                hasLegend={false} // Remove default legend
                            />
                            {/* Custom Legend */}
                            <View style={styles.legendContainer}>
                                {factorData.map((data, index) => (
                                    <View key={index} style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: data.color }]} />
                                        <Text style={styles.legendText}>{data.name}: {Math.round(data.population)}%</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/*ScaterPlot*/}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Feature vs Forecasted Energy</Text>
                    <Picker
                        selectedValue={selectedFeature}
                        style={{ height: 50, width: 200 }}
                        onValueChange={(itemValue) => handleFeatureChange(itemValue)}
                    >
                        {Object.keys(scatter_data).map((feature) => (
                            <Picker.Item key={feature} label={feature} value={feature} />
                        ))}
                    </Picker>
                    <Svg width={screenWidth - 48} height={300} style={styles.scatterPlot}>
                        {scatterPlotPoints.map(([x, y], index) => (
                            <Circle
                                key={index}
                                cx={(x / maxX) * (screenWidth - 48)}
                                cy={(1 - y / maxY) * 300} // Invert Y-axis for proper plotting
                                r="4"
                                fill="#6366F1"
                            />
                        ))}
                        <Text style={styles.scatterPlotLabel}>X: {selectedFeature} | Y: Forecasted Energy</Text>
                    </Svg>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: "#6366F1"
    },
    propsForLabels: {
        fontSize: 12,
    },
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: '#1E293B',
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statsCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statsLabel: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 8,
    },
    statsValue: {
        fontSize: 18,
        fontWeight: "700",
        color: '#1E293B',
        marginTop: 4,
    },
    chartsContainer: {
        gap: 24,
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: '#1E293B',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
    },
    pieChartContainer: {
        alignItems: 'center',
        marginTop: -20, // Adjust if needed
    },
    legendContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
        width: '100%',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: '#64748B',
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748B',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 24,
    },
    error: {
        marginTop: 12,
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 24,
    },
    noData: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
});

export default UserForecast;
