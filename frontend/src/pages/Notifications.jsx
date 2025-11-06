import { useState, useEffect } from 'react';
import { swapsApi } from '../api/swaps';
import { eventsApi } from '../api/events';

const Notifications = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSwapRequests();
  }, []);

  const loadSwapRequests = async () => {
    try {
      const data = await swapsApi.getSwapRequests();
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
    } catch (error) {
      console.error('Error loading swap requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, accepted) => {
    try {
      await swapsApi.respondToSwapRequest(requestId, { accepted });
      alert(
        `Swap request ${accepted ? 'accepted' : 'rejected'} successfully!`
      );
      loadSwapRequests();
      // Reload events to reflect changes
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to respond to swap request');
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
      case 'PENDING':
        return '#ea580c';
      case 'ACCEPTED':
        return '#16a34a';
      case 'REJECTED':
        return '#dc2626';
      default:
        return '#666';
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Swap Requests</h1>

      <div style={styles.sections}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Incoming Requests</h2>
          {incoming.length === 0 ? (
            <div style={styles.empty}>
              <p>No incoming swap requests.</p>
            </div>
          ) : (
            <div style={styles.requestsList}>
              {incoming.map((request) => (
                <div key={request.id} style={styles.requestCard}>
                  <div style={styles.requestHeader}>
                    <h3>Swap Request from {request.requester_name}</h3>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(request.status),
                      }}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div style={styles.requestDetails}>
                    <div style={styles.slotPair}>
                      <div style={styles.slotBox}>
                        <p style={styles.slotLabel}>They're offering:</p>
                        <p style={styles.slotTitle}>
                          {request.requester_slot_title}
                        </p>
                        <p style={styles.slotTime}>
                          {formatDate(request.requester_slot_start)} -{' '}
                          {formatDate(request.requester_slot_end)}
                        </p>
                      </div>
                      <div style={styles.arrow}>⇄</div>
                      <div style={styles.slotBox}>
                        <p style={styles.slotLabel}>You're offering:</p>
                        <p style={styles.slotTitle}>
                          {request.requestee_slot_title}
                        </p>
                        <p style={styles.slotTime}>
                          {formatDate(request.requestee_slot_start)} -{' '}
                          {formatDate(request.requestee_slot_end)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {request.status === 'PENDING' && (
                    <div style={styles.requestActions}>
                      <button
                        onClick={() => handleResponse(request.id, true)}
                        style={styles.acceptBtn}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleResponse(request.id, false)}
                        style={styles.rejectBtn}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Outgoing Requests</h2>
          {outgoing.length === 0 ? (
            <div style={styles.empty}>
              <p>No outgoing swap requests.</p>
            </div>
          ) : (
            <div style={styles.requestsList}>
              {outgoing.map((request) => (
                <div key={request.id} style={styles.requestCard}>
                  <div style={styles.requestHeader}>
                    <h3>Swap Request to {request.requestee_name}</h3>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(request.status),
                      }}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div style={styles.requestDetails}>
                    <div style={styles.slotPair}>
                      <div style={styles.slotBox}>
                        <p style={styles.slotLabel}>You're offering:</p>
                        <p style={styles.slotTitle}>
                          {request.requester_slot_title}
                        </p>
                        <p style={styles.slotTime}>
                          {formatDate(request.requester_slot_start)} -{' '}
                          {formatDate(request.requester_slot_end)}
                        </p>
                      </div>
                      <div style={styles.arrow}>⇄</div>
                      <div style={styles.slotBox}>
                        <p style={styles.slotLabel}>They're offering:</p>
                        <p style={styles.slotTitle}>
                          {request.requestee_slot_title}
                        </p>
                        <p style={styles.slotTime}>
                          {formatDate(request.requestee_slot_start)} -{' '}
                          {formatDate(request.requestee_slot_end)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {request.status === 'PENDING' && (
                    <p style={styles.pendingText}>Waiting for response...</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
    marginBottom: '2rem',
  },
  sections: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  section: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#2563eb',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
  },
  empty: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  requestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  requestCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  requestDetails: {
    marginBottom: '1rem',
  },
  slotPair: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  slotBox: {
    flex: 1,
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
  },
  slotLabel: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  slotTitle: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  slotTime: {
    fontSize: '0.9rem',
    color: '#666',
  },
  arrow: {
    fontSize: '1.5rem',
    color: '#2563eb',
  },
  requestActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  acceptBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  rejectBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pendingText: {
    color: '#ea580c',
    fontStyle: 'italic',
  },
};

export default Notifications;
