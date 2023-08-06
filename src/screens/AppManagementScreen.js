import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

const ApprovedTab = ({ approvedApps }) => (
  <FlatList
    data={approvedApps}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.appCard}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appDescription}>{item.description}</Text>
      </View>
    )}
  />
);

const PendingTab = ({ pendingApps, onApprove, onDisapprove }) => (
  <FlatList
    data={pendingApps}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.appCard}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appDescription}>{item.description}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => onApprove(item.id)}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.disapproveButton}
            onPress={() => onDisapprove(item.id)}
          >
            <Text style={styles.buttonText}>Disapprove</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  />
);

const AppManagementScreen = () => {
  const [approvedApps, setApprovedApps] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('apps')
      .onSnapshot((snapshot) => {
        const appList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const approved = appList.filter((app) => app.approved);
        const pending = appList.filter((app) => !app.approved);
        setApprovedApps(approved);
        setPendingApps(pending);
      });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (appId) => {
    try {
      await firestore().collection('apps').doc(appId).update({ approved: true });
    } catch (error) {
      console.error('Error approving app:', error);
    }
  };

  const handleDisapprove = async (appId) => {
    try {
      await firestore().collection('apps').doc(appId).update({ approved: false });
    } catch (error) {
      console.error('Error disapproving app:', error);
    }
  };

  const renderScene = SceneMap({
    approved: () => <ApprovedTab approvedApps={approvedApps} />,
    pending: () => (
      <PendingTab
        pendingApps={pendingApps}
        onApprove={handleApprove}
        onDisapprove={handleDisapprove}
      />
    ),
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'approved', title: 'Approved' },
    { key: 'pending', title: 'Pending' },
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>App Management</Text>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabBar: {
    backgroundColor: 'white',
    elevation: 4,
  },
  tabLabel: {
    color: 'black',
    fontWeight: 'bold',
  },
  tabIndicator: {
    backgroundColor: 'blue',
  },
  appCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    padding: 12,
    marginBottom: 12,
  },
  appName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 12,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  approveButton: {
    backgroundColor: 'green',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  disapproveButton: {
    backgroundColor: 'red',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AppManagementScreen;
