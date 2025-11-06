import { useState, useEffect } from 'react';
import { swapsApi } from '../api/swaps';
import { eventsApi } from '../api/events';

const Marketplace = () => {
  const [slots, setSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedMySlotId, setSelectedMySlotId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [slotsData, myEvents] = await Promise.all([
        swapsApi.getSwappableSlots(),
        eventsApi.getAll(),
      ]);
      setSlots(slotsData);
      setMySwappableSlots(myEvents.filter((e) => e.status === 'SWAPPABLE'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleConfirmSwap = async () => {
    if (!selectedSlot || !selectedMySlotId) {
      alert('Please select a slot to offer');
      return;
    }

    try {
      await swapsApi.createSwapRequest({
        mySlotId: selectedMySlotId,
        theirSlotId: selectedSlot.id,
      });
      setShowModal(false);
      setSelectedSlot(null);
      setSelectedMySlotId(null);
      alert('Swap request sent successfully!');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create swap request');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Marketplace - Available Slots</h1>
      <p style={styles.subtitle}>
        Browse slots from other users that are available for swapping
      </p>

      {slots.length === 0 ? (
        <div style={styles.empty}>
          <p>No swappable slots available at the moment.</p>
        </div>
      ) : (
        <div style={styles.slotsList}>
          {slots.map((slot) => (
            <div key={slot.id} style={styles.slotCard}>
              <div style={styles.slotHeader}>
                <h3 style={styles.slotTitle}>{slot.title}</h3>
                <span style={styles.owner}>by {slot.owner_name}</span>
              </div>
              <div style={styles.slotDetails}>
                <p>
                  <strong>Start:</strong> {formatDate(slot.start_time)}
                </p>
                <p>
                  <strong>End:</strong> {formatDate(slot.end_time)}
                </p>
              </div>
              <button
                onClick={() => handleRequestSwap(slot)}
                style={styles.requestBtn}
                disabled={mySwappableSlots.length === 0}
              >
                Request Swap
              </button>
            </div>
          ))}
        </div>
      )}

      {mySwappableSlots.length === 0 && (
        <div style={styles.warning}>
          <p>
            You need to have at least one swappable slot to request swaps. Go to{' '}
            <strong>My Calendar</strong> and mark some events as swappable.
          </p>
        </div>
      )}

      {showModal && selectedSlot && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Request Swap</h2>
            <div style={styles.modalContent}>
              <div style={styles.modalSection}>
                <h3>Their Slot:</h3>
                <p>
                  <strong>{selectedSlot.title}</strong>
                </p>
                <p>
                  {formatDate(selectedSlot.start_time)} -{' '}
                  {formatDate(selectedSlot.end_time)}
                </p>
                <p style={styles.ownerText}>by {selectedSlot.owner_name}</p>
              </div>

              <div style={styles.modalSection}>
                <h3>Your Slot to Offer:</h3>
                {mySwappableSlots.length === 0 ? (
                  <p style={styles.errorText}>
                    You don't have any swappable slots. Create one first!
                  </p>
                ) : (
                  <select
                    value={selectedMySlotId || ''}
                    onChange={(e) =>
                      setSelectedMySlotId(parseInt(e.target.value))
                    }
                    style={styles.select}
                    required
                  >
                    <option value="">Select a slot to offer</option>
                    {mySwappableSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.title} - {formatDate(slot.start_time)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwap}
                style={styles.confirmBtn}
                disabled={!selectedMySlotId}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#666',
    marginBottom: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#666',
  },
  slotsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  slotCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  slotHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  slotTitle: {
    fontSize: '1.2rem',
    color: '#333',
  },
  owner: {
    fontSize: '0.85rem',
    color: '#666',
  },
  slotDetails: {
    marginBottom: '1rem',
    color: '#666',
  },
  requestBtn: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  warning: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    color: '#92400e',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
  },
  modalContent: {
    marginBottom: '1.5rem',
  },
  modalSection: {
    marginBottom: '1.5rem',
  },
  ownerText: {
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'italic',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
  errorText: {
    color: '#dc2626',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
  },
  confirmBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Marketplace;
