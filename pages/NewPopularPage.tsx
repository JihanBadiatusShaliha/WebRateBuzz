import React, { useState, useEffect } from 'react';
import { getTopRatedMovies, getNowPlayingMovies } from '../api/tmdb';
import MovieCarousel from '../components/MovieCarousel';
import { Movie } from '../types';
import BackButton from '../components/BackButton';

const NewPopularPage: React.FC = () => {
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
    const [newMovies, setNewMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [popular, nowPlaying] = await Promise.all([
                    getTopRatedMovies(),
                    getNowPlayingMovies()
                ]);
                setPopularMovies(popular);
                setNewMovies(nowPlaying);
            } catch (error) {
                console.error("Failed to fetch new and popular movies:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);


    return (
        <div className="pt-24 pb-12 min-h-screen">
             <div className="flex items-center gap-4 mb-8 px-4 sm:px-8 md:px-16">
                <BackButton />
                <h1 className="text-3xl md:text-4xl font-bold">Baru & Populer</h1>
            </div>
            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <>
                    <MovieCarousel title="Paling Populer" movies={popularMovies} />
                    <MovieCarousel title="Rilisan Terbaru" movies={newMovies} />
                </>
            )}
        </div>
    );
};

export default NewPopularPage;