import { useState, useEffect } from 'react';
import { eventsApi } from '../api/events';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormData({ title: '', startTime: '', endTime: '' });
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      startTime: event.start_time.substring(0, 16),
      endTime: event.end_time.substring(0, 16),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, {
          title: formData.title,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        });
      } else {
        await eventsApi.create({
          title: formData.title,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        });
      }
      setShowModal(false);
      loadEvents();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save event');
    }
  };

  const handleToggleSwappable = async (event) => {
    try {
      const newStatus = event.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
      await eventsApi.update(event.id, { status: newStatus });
      loadEvents();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update event');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsApi.delete(id);
      loadEvents();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete event');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'BUSY':
        return '#dc2626';
      case 'SWAPPABLE':
        return '#16a34a';
      case 'SWAP_PENDING':
        return '#ea580c';
      default:
        return '#666';
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>My Calendar</h1>
        <button onClick={handleCreateEvent} style={styles.createBtn}>
          + Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div style={styles.empty}>
          <p>No events yet. Create your first event to get started!</p>
        </div>
      ) : (
        <div style={styles.eventsList}>
          {events.map((event) => (
            <div key={event.id} style={styles.eventCard}>
              <div style={styles.eventHeader}>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(event.status),
                  }}
                >
                  {event.status.replace('_', ' ')}
                </span>
              </div>
              <div style={styles.eventDetails}>
                <p>
                  <strong>Start:</strong> {formatDate(event.start_time)}
                </p>
                <p>
                  <strong>End:</strong> {formatDate(event.end_time)}
                </p>
              </div>
              <div style={styles.eventActions}>
                {event.status !== 'SWAP_PENDING' && (
                  <button
                    onClick={() => handleToggleSwappable(event)}
                    style={{
                      ...styles.actionBtn,
                      backgroundColor:
                        event.status === 'SWAPPABLE' ? '#dc2626' : '#16a34a',
                    }}
                  >
                    {event.status === 'SWAPPABLE'
                      ? 'Mark as Busy'
                      : 'Make Swappable'}
                  </button>
                )}
                {event.status !== 'SWAP_PENDING' && (
                  <button
                    onClick={() => handleEditEvent(event)}
                    style={{ ...styles.actionBtn, backgroundColor: '#2563eb' }}
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(event.id)}
                  style={{ ...styles.actionBtn, backgroundColor: '#dc2626' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formField}>
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formField}>
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formField}>
                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  {editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
  },
  createBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#666',
  },
  eventsList: {
    display: 'grid',
    gap: '1rem',
  },
  eventCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  eventTitle: {
    fontSize: '1.3rem',
    color: '#333',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  eventDetails: {
    marginBottom: '1rem',
    color: '#666',
  },
  eventActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.5rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
  formField: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Dashboard;
