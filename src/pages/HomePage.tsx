import React, { useState, useEffect } from 'react';
import { Movie, MovieCategory } from '../types';
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies } from '../api/tmdb';
import MovieCarousel from '../components/MovieCarousel';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [categories, setCategories] = useState<MovieCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomePageData = async () => {
            try {
                setLoading(true);
                const [popular, topRated, nowPlaying] = await Promise.all([
                    getPopularMovies(),
                    getTopRatedMovies(),
                    getNowPlayingMovies(),
                ]);
                
                if (popular.length > 0) {
                    setHeroMovie(popular[0]);
                }

                setCategories([
                    { title: 'Trending Now', movies: popular },
                    { title: 'Top Rated Films', movies: topRated },
                    { title: 'Now Playing in Theaters', movies: nowPlaying },
                ]);

            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomePageData();
    }, []);

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            {heroMovie && (
                 <div className="relative h-[60vh] md:h-[80vh] w-full -mt-20">
                    <img 
                        src={heroMovie.backdropUrl}
                        alt={heroMovie.title} 
                        className="w-full h-full object-cover object-top" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 sm:p-8 md:p-16 w-full md:w-1/2 lg:w-2/5">
                        <h1 className="text-3xl md:text-5xl font-black mb-4 text-white">{heroMovie.title}</h1>
                        <p className="text-slate-300 hidden md:block mb-6 line-clamp-3">{heroMovie.description}</p>
                        <div className="flex space-x-4">
                            <Link to={`/movie/${heroMovie.id}`} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition-colors flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Info Lengkap
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Movie Carousels Section */}
            <div className="py-8">
                {categories.map((category) => (
                    <MovieCarousel
                        key={category.title}
                        title={category.title}
                        movies={category.movies}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomePage;