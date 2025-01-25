import { useState, useEffect } from 'react';
import { requireClassification } from '../middleware/accessControl';

export default function TermModal({ termId, onClose }) {
  const [termData, setTermData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTerm = async () => {
      const response = await fetch(`/api/terms/${termId}`);
      const data = await response.json();
      setTermData(data);
      setLoading(false);
    };
    loadTerm();
  }, [termId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/terms/${termId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          ...termData,
          o5_approver: user.id // From auth context
        })
      });
      
      if (response.ok) {
        onClose(true); // Refresh parent
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 w-full max-w-2xl">
        {loading ? (
          <div>Loading term data...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block font-bold mb-2">Term</label>
                <input
                  type="text"
                  value={termData.term}
                  disabled={!isEditing}
                  onChange={(e) => setTermData({...termData, term: e.target.value})}
                  className="w-full p-2 border"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block font-bold mb-2">Official Definition</label>
                <textarea
                  value={termData.official_definition || ''}
                  disabled={!isEditing}
                  onChange={(e) => setTermData({...termData, official_definition: e.target.value})}
                  className="w-full p-2 border h-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="glossary-term"
                  checked={termData.is_glossary_term}
                  disabled={!isEditing}
                  onChange={(e) => setTermData({...termData, is_glossary_term: e.target.checked})}
                />
                <label htmlFor="glossary-term">Glossary Term</label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-black text-white"
                >
                  Edit Term (O5 Only)
                </button>
              )}
            </div>
          </form>
        )}
        
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 text-2xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}
