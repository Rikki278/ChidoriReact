import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChidoriBackground from '../components/ChidoriBackground';
import MainHeader from '../components/main/MainHeader';
import './AnimeFullInfoPage.css';

const fetchAnimeFullInfo = async (title) => {
  const res = await fetch(`/api/anime/jikan/search/full-info?query=${encodeURIComponent(title)}&limit=1`);
  if (!res.ok) throw new Error('Failed to fetch anime info');
  const data = await res.json();
  return data[0];
};

const AnimeFullInfoPage = () => {
  const { title } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchAnimeFullInfo(title)
      .then(setAnime)
      .catch(() => setError('Failed to load anime info'))
      .finally(() => setLoading(false));
  }, [title]);

  if (loading) return <div className="anime-fullinfo-loader">Loading...</div>;
  if (error || !anime) return <div className="anime-fullinfo-error">{error || 'Anime not found'}</div>;

  return (
    <div className="home-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <ChidoriBackground />
      <MainHeader />
      <div className="anime-fullinfo-root">
        <div className="anime-fullinfo-body">
          <div className="anime-fullinfo-poster-block">
            <img src={anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url} alt={anime.title} className="anime-fullinfo-poster" />
          </div>
          <div className="anime-fullinfo-info-block">
            <div className="anime-fullinfo-title-row">
              <span className="anime-fullinfo-title">{anime.title}</span>
              {anime.japaneseTitle && <span className="anime-fullinfo-jptitle">{anime.japaneseTitle}</span>}
            </div>
            <div className="anime-fullinfo-genres-row">
              {anime.genres?.map((g, i) => (
                <span className="anime-fullinfo-genre-tag" key={g + i}>{g}</span>
              ))}
            </div>
            <div className="anime-fullinfo-meta-row">
              <span className="anime-fullinfo-type">{anime.type}</span>
              <span className="anime-fullinfo-episodes">Episodes: {anime.episodes}</span>
              <span className="anime-fullinfo-status">{anime.status}</span>
              <span className="anime-fullinfo-score">Score: {anime.score}</span>
              {anime.aired && <span className="anime-fullinfo-date">Aired: {new Date(anime.aired).toLocaleDateString()}</span>}
            </div>
            <div className="anime-fullinfo-synopsis">{anime.synopsis}</div>
            {anime.trailer?.youtube_id && (
              <div className="anime-fullinfo-trailer-block">
                <iframe
                  title="Anime Trailer"
                  width="360"
                  height="210"
                  src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="anime-fullinfo-trailer"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeFullInfoPage; 