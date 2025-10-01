import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { getPopularMovies } from '../api/tmdb';
import BackButton from '../components/BackButton';

const AllMoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllMovies = async () => {
      setIsLoading(true);
      try {
        // For an "All Movies" page, we'll start by showing popular ones.
        // A real implementation might use pagination.
        const popularMovies = await getPopularMovies();
        setMovies(popularMovies);
      } catch (error) {
        console.error("Failed to fetch all movies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllMovies();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-16 pt-24 pb-12 min-h-screen">
       <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <h1 className="text-3xl md:text-4xl font-bold">All Movies</h1>
      </div>
      {isLoading ? (
         <div className="text-center py-20">
          <p className="text-xl text-slate-400">Loading movies...</p>
        </div>
      ) : movies.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-slate-400">No movies found.</p>
        </div>
      )}
    </div>
  );
};

export default AllMoviesPage;