import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_USERS } from '../constants/users';
import { Movie, Review } from '../types';
import { getMovieDetails } from '../api/tmdb';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import { useWatchList } from '../context/WatchListContext';
import { getMovieSummary } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';


const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [geminiSummary, setGeminiSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingMovie, setIsLoadingMovie] = useState<boolean>(true);

  const { addToWatchList, removeFromWatchList, isInWatchList } = useWatchList();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMovieData = async () => {
      if (id) {
        setIsLoadingMovie(true);
        window.scrollTo(0, 0);
        try {
          const movieId = parseInt(id, 10);
          const foundMovie = await getMovieDetails(movieId);
          setMovie(foundMovie);
          
          if(foundMovie) {
            // Fetch reviews from all users for this specific movie
            const movieReviews = MOCK_USERS.flatMap(user => user.reviews).filter(review => review.movieId === foundMovie.id);
            setReviews(movieReviews);
          }
        } catch (error) {
          console.error("Failed to fetch movie details:", error);
          setMovie(null);
        } finally {
          setIsLoadingMovie(false);
        }
      }
    };
    fetchMovieData();
  }, [id]);
  
  const handleAddReview = (newReview: Omit<Review, 'id' | 'author' | 'movieId' | 'movieTitle' | 'moviePosterUrl'>) => {
    if (movie && currentUser) {
      const reviewWithId: Review = {
        ...newReview,
        id: Date.now(),
        author: currentUser.username,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePosterUrl: movie.posterUrl,
      };
      setReviews(prevReviews => [reviewWithId, ...prevReviews]);
      // In a real app, this would also update the central user data
    }
  };

  const handleGenerateSummary = async () => {
    if (movie && !geminiSummary) {
      setIsLoadingSummary(true);
      try {
        const summary = await getMovieSummary(movie.title);
        setGeminiSummary(summary);
      } catch (error) {
        console.error("Failed to generate summary:", error);
        setGeminiSummary("Sorry, couldn't generate a summary at this time.");
      } finally {
        setIsLoadingSummary(false);
      }
    }
  };

  if (isLoadingMovie) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!movie) {
    return <div className="flex justify-center items-center h-screen">Movie not found.</div>;
  }
  
  const isWatched = isInWatchList(movie.id);

  return (
    <div className="bg-slate-900">
        {/* Back button */}
        <BackButton className="absolute top-5 left-5" />
        
        {/* Hero Section */}
        <div className="relative h-[70vh] w-full">
            <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-12">
                <h1 className="text-4xl md:text-6xl font-black">{movie.title}</h1>
                <div className="flex items-center mt-4 space-x-4 text-slate-300">
                    <span>{movie.releaseYear}</span>
                    <span className="border-l border-slate-500 pl-4">{movie.genre.join(', ')}</span>
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto p-6 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <p className="text-lg text-slate-300 mb-6">{movie.description}</p>
                    <div className="mb-6">
                        <StarRating rating={movie.rating} totalStars={10} size="lg" />
                    </div>
                     <div className="flex flex-wrap gap-4 mb-8">
                        <button 
                          onClick={() => isWatched ? removeFromWatchList(movie.id) : addToWatchList(movie)}
                          className={`px-6 py-3 font-bold rounded-md transition-colors flex items-center ${isWatched ? 'bg-slate-700 hover:bg-slate-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                           {isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        </button>
                        <button
                          onClick={handleGenerateSummary}
                          disabled={isLoadingSummary || !!geminiSummary}
                          className="px-6 py-3 font-bold rounded-md transition-colors bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                           {isLoadingSummary ? 'Generating...' : (geminiSummary ? 'Summary Generated!' : '✨ Generate AI Summary')}
                        </button>
                    </div>

                    {geminiSummary && (
                      <div className="mb-8 p-4 bg-slate-800 border-l-4 border-indigo-500 rounded-r-lg">
                        <h3 className="font-bold text-lg mb-2 text-indigo-400">AI Summary</h3>
                        <p className="text-slate-300 italic">{geminiSummary}</p>
                      </div>
                    )}

                    {movie.streamingSources.length > 0 && (
                      <div className="mb-8">
                          <h3 className="text-2xl font-bold mb-4">Where to Watch</h3>
                          <div className="flex flex-wrap gap-4">
                              {movie.streamingSources.map(source => (
                                  <a key={source.platform} href={source.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors">{source.platform}</a>
                              ))}
                          </div>
                      </div>
                    )}
                    
                    <ReviewList reviews={reviews} />
                    <ReviewForm onSubmit={handleAddReview} />
                </div>
                <div className="md:col-span-1">
                    <img src={movie.posterUrl} alt={movie.title} className="rounded-lg shadow-lg w-full" />
                </div>
            </div>
        </div>
    </div>
  );
};

export default DetailPage;