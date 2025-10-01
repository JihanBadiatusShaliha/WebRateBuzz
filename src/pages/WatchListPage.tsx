import React from 'react';
import { useWatchList } from '../context/WatchListContext';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

const WatchListPage: React.FC = () => {
  const { watchList } = useWatchList();

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-16 pt-24 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <h1 className="text-3xl md:text-4xl font-bold">Daftar Tonton Nanti</h1>
      </div>
      {watchList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {watchList.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-slate-400 mb-4">Your watchlist is empty.</p>
          <p className="text-slate-500 mb-8">Add movies to your list to see them here.</p>
          <Link to="/" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition-colors">
            Browse Movies
          </Link>
        </div>
      )}
    </div>
  );
};

export default WatchListPage;