import React, { useState, useRef, useEffect } from 'react';
import './CreatePostModal.css';

const getToken = () => localStorage.getItem('accessToken'); // Adjust if you use another storage

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const modalRef = useRef(null);
  const [characterName, setCharacterName] = useState('');
  const [anime, setAnime] = useState('');
  const [animeGenre, setAnimeGenre] = useState([]);
  const [description, setDescription] = useState('');
  const [characterImage, setCharacterImage] = useState(null);
  const [animeOptions, setAnimeOptions] = useState([]);
  const [showAnimeDropdown, setShowAnimeDropdown] = useState(false);
  const [animeLoading, setAnimeLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const animeDropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      setCharacterName('');
      setAnime('');
      setAnimeGenre([]);
      setDescription('');
      setCharacterImage(null);
      setAnimeOptions([]);
      setShowAnimeDropdown(false);
      setErrors({});
      setSubmitError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (anime.length < 1) {
      setAnimeOptions([]);
      setShowAnimeDropdown(false);
      return;
    }
    setAnimeLoading(true);
    const controller = new AbortController();
    const fetchAnime = async () => {
      try {
        const token = getToken();
        const url = `/api/anime/jikan/search?query=${encodeURIComponent(anime)}`;
        console.log('[Anime Search] Query:', anime);
        console.log('[Anime Search] URL:', url);
        console.log('[Anime Search] Token:', token);
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal,
        });
        console.log('[Anime Search] Response status:', res.status);
        const text = await res.text();
        console.log('[Anime Search] Raw response:', text);
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Response is not valid JSON');
        }
        console.log('[Anime Search] Data:', data);
        setAnimeOptions(data);
        setShowAnimeDropdown(true);
      } catch (err) {
        console.log('[Anime Search] Error:', err);
        setAnimeOptions([]);
        setShowAnimeDropdown(false);
      } finally {
        setAnimeLoading(false);
      }
    };
    const timeout = setTimeout(fetchAnime, 350);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [anime]);

  const handleAnimeSelect = (option) => {
    setAnime(option.title);
    setAnimeGenre(option.genres);
    setShowAnimeDropdown(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!characterName.trim()) newErrors.characterName = 'Character name is required.';
    if (!anime.trim()) newErrors.anime = 'Anime is required.';
    if (!animeGenre.length) newErrors.animeGenre = 'Anime genres are required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!characterImage) newErrors.characterImage = 'Character image is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = getToken();
      const post = {
        characterName,
        anime,
        animeGenre,
        description,
      };
      const formData = new FormData();
      const postBlob = new Blob([JSON.stringify(post)], { type: 'application/json' });
      formData.append('post', postBlob);
      if (characterImage) {
        formData.append('characterImage', characterImage);
      }
      // Логируем содержимое FormData
      for (let [key, value] of formData.entries()) {
        console.log('FormData:', key, value);
      }
      console.log('[Post Submit] POST:', post);
      console.log('[Post Submit] Token:', token);
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      console.log('[Post Submit] Response status:', res.status);
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to create post');
      }
      onPostCreated && onPostCreated();
      onClose();
    } catch (err) {
      console.log('[Post Submit] Error:', err);
      setSubmitError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  return isOpen ? (
    <div className="modal-backdrop" tabIndex={-1} aria-modal="true" role="dialog" onClick={handleBackdropClick}>
      <div className="modal-content" ref={modalRef} tabIndex={0}>
        <button
          className="modal-close-btn"
          aria-label="Close modal"
          onClick={onClose}
          tabIndex={0}
        >
          &times;
        </button>
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit} autoComplete="off" noValidate>
          <div className="form-group">
            <label htmlFor="characterName">Character Name</label>
            <input
              id="characterName"
              type="text"
              value={characterName}
              onChange={e => setCharacterName(e.target.value)}
              aria-invalid={!!errors.characterName}
              aria-describedby="characterName-error"
              required
            />
            {errors.characterName && <div className="form-error" id="characterName-error">{errors.characterName}</div>}
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="anime">Anime</label>
            <input
              id="anime"
              type="text"
              value={anime}
              onChange={e => {
                setAnime(e.target.value);
                setAnimeGenre([]);
              }}
              aria-invalid={!!errors.anime}
              aria-describedby="anime-error"
              autoComplete="off"
              required
              onFocus={() => animeOptions.length && setShowAnimeDropdown(true)}
            />
            {animeLoading && <div className="form-loading">Loading...</div>}
            {showAnimeDropdown && animeOptions.length > 0 && (
              <ul className="anime-dropdown" ref={animeDropdownRef}
                onMouseDown={e => e.preventDefault()}
              >
                {animeOptions.map((option, idx) => (
                  <li
                    key={option.id + '-' + idx}
                    tabIndex={0}
                    onMouseDown={() => handleAnimeSelect(option)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleAnimeSelect(option)}
                    aria-label={`Select anime ${option.title}`}
                  >
                    {option.title}
                  </li>
                ))}
              </ul>
            )}
            {errors.anime && <div className="form-error" id="anime-error">{errors.anime}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="animeGenre">Anime Genres</label>
            <input
              id="animeGenre"
              type="text"
              value={animeGenre.join(', ')}
              disabled
              aria-invalid={!!errors.animeGenre}
              aria-describedby="animeGenre-error"
              required
            />
            {errors.animeGenre && <div className="form-error" id="animeGenre-error">{errors.animeGenre}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              aria-invalid={!!errors.description}
              aria-describedby="description-error"
              required
            />
            {errors.description && <div className="form-error" id="description-error">{errors.description}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="characterImage">Character Image</label>
            <input
              id="characterImage"
              type="file"
              accept="image/*"
              onChange={e => setCharacterImage(e.target.files[0])}
              aria-invalid={!!errors.characterImage}
              aria-describedby="characterImage-error"
              required
            />
            {errors.characterImage && <div className="form-error" id="characterImage-error">{errors.characterImage}</div>}
          </div>
          {submitError && <div className="form-error form-submit-error">{submitError}</div>}
          <button type="submit" className="form-submit-btn" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  ) : null;
};

export default CreatePostModal; 