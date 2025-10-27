// src/components/Steganography.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/Steganography.css';

const Steganography = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('encode');
  const [image, setImage] = useState(null);
  const [password, setPassword] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [decodedPassword, setDecodedPassword] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage));
    }
  };

  const handleEncode = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login to use this feature');
      return;
    }
    
    if (!image || !password || !key) {
      setError('Please provide an image, password, and encryption key');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('password', password);
    formData.append('key', key);
    
    try {
      const response = await fetch('http://localhost:5000/encode', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to encode password');
      }
      
      // Handle successful response (should be an image file)
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'encoded_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Password successfully encoded in image! Download started.');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login to use this feature');
      return;
    }
    
    if (!image || !key) {
      setError('Please provide an image and the correct decryption key');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setDecodedPassword('');
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('key', key);
    
    try {
      const response = await fetch('http://localhost:5000/decode', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to decode password');
      }
      
      setDecodedPassword(data.password);
      setSuccess('Password successfully decoded from image!');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stego-container">
      <div className="stego-card">
        <h2>Image Steganography Tool</h2>
        <p className="stego-description">
          Hide your passwords securely within images or decode hidden passwords from images.
        </p>
        
        <div className="stego-tabs">
          <button 
            className={`stego-tab ${activeTab === 'encode' ? 'active' : ''}`}
            onClick={() => setActiveTab('encode')}
          >
            Encode Password
          </button>
          <button 
            className={`stego-tab ${activeTab === 'decode' ? 'active' : ''}`}
            onClick={() => setActiveTab('decode')}
          >
            Decode Password
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {activeTab === 'encode' ? (
          <form onSubmit={handleEncode} className="stego-form">
            <div className="form-group">
              <label htmlFor="image">Upload Image</label>
              <input
                type="file"
                id="image"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                disabled={loading}
                className="file-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password to Hide</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to hide"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="key">Encryption Key</label>
              <input
                type="password"
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter encryption key"
                disabled={loading}
              />
              <small className="key-hint">Remember this key to decode the password later</small>
            </div>
            
            {imagePreview && (
              <div className="image-preview">
                <h3>Selected Image</h3>
                <img src={imagePreview} alt="Selected for encoding" />
              </div>
            )}
            
            <button type="submit" className="stego-button" disabled={loading}>
              {loading ? 'Processing...' : 'Encode Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleDecode} className="stego-form">
            <div className="form-group">
              <label htmlFor="decode-image">Upload Image</label>
              <input
                type="file"
                id="decode-image"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                disabled={loading}
                className="file-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="decode-key">Decryption Key</label>
              <input
                type="password"
                id="decode-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter decryption key"
                disabled={loading}
              />
            </div>
            
            {imagePreview && (
              <div className="image-preview">
                <h3>Selected Image</h3>
                <img src={imagePreview} alt="Selected for decoding" />
              </div>
            )}
            
            <button type="submit" className="stego-button" disabled={loading}>
              {loading ? 'Processing...' : 'Decode Password'}
            </button>
            
            {decodedPassword && (
              <div className="decoded-result">
                <h3>Decoded Password:</h3>
                <div className="password-display">{decodedPassword}</div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Steganography;