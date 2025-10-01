import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { searchMovies } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import { Movie } from '../types';
import BackButton from '../components/BackButton';

const SearchResultsPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
        setResults([]);
        return;
    };
    
    const performSearch = async () => {
      setIsLoading(true);
      try {
        const filteredMovies = await searchMovies(query);
        setResults(filteredMovies);
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    performSearch();

  }, [query]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-20">Searching...</div>;
    }

    if (results.length > 0) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      );
    }
    
    // Show this message only if there's a query and loading is finished
    if (query) {
       return (
        <div className="text-center py-20">
            <p className="text-xl text-slate-400">Tidak ada film yang ditemukan.</p>
            <p className="text-slate-500 mt-2">Coba cari dengan kata kunci lain.</p>
        </div>
        );
    }

    return null; // Don't show anything if there is no query
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-16 pt-24 pb-12 min-h-screen">
      <div className="flex items-center gap-4 mb-2">
        <BackButton />
        <h1 className="text-3xl md:text-4xl font-bold">Hasil Pencarian</h1>
      </div>
      <p className="text-slate-400 text-lg mb-8 ml-14">
        Menampilkan hasil untuk: <span className="font-bold text-white">"{query}"</span>
      </p>
      {renderContent()}
    </div>
  );
};

export default SearchResultsPage;