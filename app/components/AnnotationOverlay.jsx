import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AnnotationTooltip = ({ flag }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef();

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setShowTooltip(true), 5000);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setShowTooltip(false);
  };

  return (
    <span 
      className={`annotation ${flag.flag_type}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showTooltip && (
        <div className="tooltip animate-fadeIn">
          <div className={`header ${flag.color_code}`} />
          <h4>{flag.flag_type}</h4>
          <p>{flag.comment}</p>
          <VoteInterface flag={flag} />
        </div>
      )}
    </span>
  );
};

const VoteInterface = ({ flag }) => {
  const { user } = useAuth();
  const [currentVote, setCurrentVote] = useState(null);

  useEffect(() => {
    const fetchVote = async () => {
      const res = await fetch(`/api/flags/${flag.flag_id}/votes/${user.id}`);
      const data = await res.json();
      setCurrentVote(data?.vote);
    };
    if(user) fetchVote();
  }, [user, flag.flag_id]);

  const handleVote = async (vote) => {
    const res = await fetch(`/api/flags/${flag.flag_id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ vote })
    });
    const data = await res.json();
    setCurrentVote(data.approved ? null : vote);
  };

  return (
    <div className="vote-container">
      <button 
        className={`upvote ${currentVote === 1 ? 'active' : ''}`}
        onClick={() => handleVote(1)}
      >
        ▲ {flag.net_votes}
      </button>
      <button
        className={`downvote ${currentVote === -1 ? 'active' : ''}`}
        onClick={() => handleVote(-1)}
      >
        ▼
      </button>
    </div>
  );
};

export default AnnotationTooltip; 