import React, { useState, useRef, useEffect } from 'react';

/**
 * Autocomplete component for user selection
 * @param {string} value - Current input value
 * @param {function} onChange - Called when value changes
 * @param {array} options - Array of user objects {id, fullName, email, role}
 * @param {string} placeholder - Input placeholder text
 * @param {string} name - Input name attribute
 * @param {string} className - Additional CSS classes
 */
export default function UserAutocomplete({
  value,
  onChange,
  options = [],
  placeholder = 'Search users...',
  name,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize from value prop
  useEffect(() => {
    if (value && options.length > 0) {
      // Check if value is a user object or string
      if (typeof value === 'object' && value.id) {
        setSelectedUser(value);
        setSearchTerm(value.fullName || value.email);
      } else if (typeof value === 'string') {
        // Try to find user by name or email
        const user = options.find(u => 
          u.fullName === value || 
          u.email === value ||
          u.id === value
        );
        if (user) {
          setSelectedUser(user);
          setSearchTerm(user.fullName || user.email);
        } else {
          setSearchTerm(value);
        }
      }
    } else if (!value) {
      setSearchTerm('');
      setSelectedUser(null);
    }
  }, [value, options]);

  // Filter options based on search term
  const filteredOptions = options.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      (user.fullName || '').toLowerCase().includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.role || '').toLowerCase().includes(search)
    );
  });

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setSelectedUser(null);
    
    // Call onChange with string value while typing
    onChange({ target: { name, value: newValue } });
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.fullName || user.email);
    setIsOpen(false);
    
    // Call onChange with user object
    onChange({ 
      target: { 
        name, 
        value: {
          id: user.id,
          name: user.fullName || user.email,
          email: user.email,
          role: user.role
        }
      } 
    });
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedUser(null);
    setIsOpen(false);
    onChange({ target: { name, value: '' } });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          name={name}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
        
        {/* Search Icon */}
        {!selectedUser && (
          <svg 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        
        {/* Clear Button */}
        {selectedUser && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Selected User Badge */}
      {selectedUser && (
        <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
          <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-medium">
            {(selectedUser.fullName || selectedUser.email || '?')[0].toUpperCase()}
          </div>
          <span className="font-medium">{selectedUser.fullName || selectedUser.email}</span>
          <span className="text-blue-500">•</span>
          <span className="text-blue-600">{selectedUser.role || 'employee'}</span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectUser(user)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium text-sm flex-shrink-0">
                  {(user.fullName || user.email || '?')[0].toUpperCase()}
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName || user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-600 capitalize">{user.role || 'employee'}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && searchTerm && filteredOptions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
}
