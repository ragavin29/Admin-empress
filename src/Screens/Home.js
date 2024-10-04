import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import styles from './HomeScreen.module.css';
import usericon from '../images/user.png';
import plusicon from '../images/plus.png';
import DeleteIcon from '../images/delete.png'; 


const initialCabs = [
  { id: '1', model: 'Toyota Camry', licensePlate: 'XYZ 1234', driverId: '1' },
  { id: '2', model: 'Honda Accord', licensePlate: 'ABC 5678', driverId: '2' },
];

function HomeScreen() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]); 
  const [drivers, setDrivers] = useState([]);
  const [cabs, setCabs] = useState(initialCabs);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDriver, setNewDriver] = useState({ name: '', licenseNumber: '', mobileNumber: '' });
  const [newCab, setNewCab] = useState({ model: '', licensePlate: '', driverId: '' });
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddCabModal, setShowAddCabModal] = useState(false);

 
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken'); 
        const response = await axios.get('http://13.60.25.121/api/test/cabadmin/users', {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        setUsers(response.users); 
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers(); 
  }, []); 

 

  const blockUser = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`http://13.60.25.121/api/test/cabadmin/users/block/${userId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUsers = users.filter(user => user._id !== userId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = localStorage.getItem('authToken'); 
        const response = await axios.get('http://13.60.25.121/api/test/cabadmin/drivers', {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        setDrivers(response.data); 
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
  
    
    fetchDrivers(); 
  }, []); 

  const deleteCabDriver = async (driverId) => {
    try {
      const token = localStorage.getItem('authToken'); 
      await axios.delete(`http://13.60.25.121/api/test/cabadmin/drivers/delete-driver/${driverId}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      const updatedDrivers = drivers.filter(driver => driver.id !== driverId);
      setDrivers(updatedDrivers);
    } catch (error) {
      console.error("Error deleting driver:", error);
    }
  };


  const handleAddDriver = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken'); 

    try {
        const response = await axios.post('http://13.60.25.121/api/test/cabadmin/drivers/add-driver', {
            firstName: newDriver.name.split(' ')[0], 
            lastName: newDriver.name.split(' ')[1] || '', 
            email: newDriver.email, 
            vehicle: newCab.licensePlate, 
            driverId: `D2024${drivers.length + 1}` 
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.success) {
         
            setDrivers([...drivers, response.data.driver]);
            setNewDriver({ name: '', licenseNumber: '', mobileNumber: '' });
            setShowAddDriverModal(false);
        }
    } catch (error) {
        console.error("Error adding driver:", error);
    }
};


  const handleBlockCab = (cabId) => {
    const updatedCabs = cabs.filter(cab => cab.id !== cabId);
    setCabs(updatedCabs);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  

  const handleAddCab = (e) => {
    e.preventDefault();
    const newId = (cabs.length + 1).toString();
    setCabs([...cabs, { id: newId, ...newCab }]);
    setNewCab({ model: '', licensePlate: '', driverId: '' });
    setShowAddCabModal(false);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCabs = cabs.filter(cab =>
    cab.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div>
            <h2 className={styles.headertext}>Users List</h2>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchBar}
            />
             <ul>
              {filteredUsers.map(user => (
                <li key={user._id} className={styles.username}>
                  {user.username} ({user.email})
                  <button
                    onClick={() => blockUser(user._id)} 
                    className={styles.blockButton}
                  >
                    Block
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'drivers':
        return (
          <div>
            <h2 className={styles.headertext}>Drivers List</h2>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchBar}
              />
              <img 
                src={plusicon} 
                alt="Add Driver" 
                className={styles.addIcon} 
                onClick={() => setShowAddDriverModal(true)} 
              />
              <span className={styles.addDriverText}>Add Driver</span>
            </div>
            <ul>
              {drivers.filter(driver =>
                driver.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(driver => (
                <li key={driver.id} className={styles.username}>
                  {driver.name} (License: {driver.licenseNumber}, Mobile: {driver.mobileNumber})
                  <button
                    onClick={() => deleteCabDriver(driver.id)} 
                    className={styles.blockButton}
                  >
                    Block
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'cabs':
        return (
          <div>
            <h2 className={styles.headertext}>Cabs List</h2>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search cabs..."
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchBar}
              />
              <img 
                src={plusicon} 
                alt="Add Cab" 
                className={styles.addIcon} 
                onClick={() => setShowAddCabModal(true)} 
              />
              <span className={styles.addDriverText}>Add Cab</span>
            </div>
            <ul>
              {filteredCabs.map(cab => (
                <li key={cab.id} className={styles.username}>
                  {cab.model} (License Plate: {cab.licensePlate})
                  <button
                    onClick={() => handleBlockCab(cab.id)}
                    className={styles.blockButton}
                  >
                    Block
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.homeContainer}>
      <header className={styles.homeHeader}>
        <h1>Welcome to Empress</h1>
        <div className={styles.tabContainer}>
          <button
            className={activeTab === 'users' ? styles.activeTab : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={activeTab === 'drivers' ? styles.activeTab : ''}
            onClick={() => setActiveTab('drivers')}
          >
            Drivers
          </button>
          <button
            className={activeTab === 'cabs' ? styles.activeTab : ''}
            onClick={() => setActiveTab('cabs')}
          >
            Cabs
          </button>
          <img src={usericon} className={styles.profileicon} alt="Profile Icon" />
        </div>
      </header>

      <div className={styles.tabContent}>
        {renderContent()}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerSection}>
          <span>Current Bookings: {users.length}</span>
        </div>
        <div className={styles.footerSection}>
          <span>Total Bookings: {users.length}</span>
        </div>
        <div className={styles.footerSection}>
          <span>Available Cabs: {cabs.length}</span>
        </div>
        <div className={styles.footerSection}>
          <span>Drivers Available: {drivers.length}</span>
        </div>
      </footer>
      {showAddDriverModal && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2 onClick={() => setShowAddDriverModal(false)}>Add New Cab Driver</h2>
      <img src={DeleteIcon} alt="Close" className={styles.deleteIcon} onClick={() => setShowAddDriverModal(false)} />
      <form onSubmit={handleAddDriver} className={styles.modalForm}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Full Name"
          value={newDriver.name}
          onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
          required
        />
        <label htmlFor="licenseNumber">License Number</label>
        <input
          id="licenseNumber"
          type="text"
          placeholder="License Number"
          value={newDriver.licenseNumber}
          onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
          required
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={newDriver.email}
          onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
          required
        />
        <label htmlFor="mobileNumber">Mobile Number</label>
        <input
          id="mobileNumber"
          type="text"
          placeholder="Mobile Number"
          value={newDriver.mobileNumber}
          onChange={(e) => setNewDriver({ ...newDriver, mobileNumber: e.target.value })}
          required
        />
        <button type="submit">Add Driver</button>
      </form>
    </div>
  </div>
)}


{showAddCabModal && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h2 onClick={() => setShowAddCabModal(false)}>Add New Cab</h2>
      <img src={DeleteIcon} alt="Close" className={styles.deleteIcon} onClick={() => setShowAddCabModal(false)} />
      <form onSubmit={handleAddCab} className={styles.modalForm}>
        <label htmlFor="model">Model</label>
        <input
          id="model"
          type="text"
          placeholder="Model"
          value={newCab.model}
          onChange={(e) => setNewCab({ ...newCab, model: e.target.value })}
          required
        />
        <label htmlFor="licensePlate">License Plate</label>
        <input
          id="licensePlate"
          type="text"
          placeholder="License Plate"
          value={newCab.licensePlate}
          onChange={(e) => setNewCab({ ...newCab, licensePlate: e.target.value })}
          required
        />
        <label htmlFor="driverId">Driver ID</label>
        <input
          id="driverId"
          type="text"
          placeholder="Driver ID"
          value={newCab.driverId}
          onChange={(e) => setNewCab({ ...newCab, driverId: e.target.value })}
          required
        />
        <button type="submit">Add Cab</button>
      </form>
    </div>
  </div>
)}

    </div>
  );
}

export default HomeScreen;
