import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import ScrollToTop from '../components/ScrollToTop';

const GenrePage = () => {
    const { genreName } = useParams();
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSeries = async () => {
            setLoading(true);
            try {
                const response = await api.get(`series/genre/${genreName}`);
                setSeries(response.data);
            } catch (error) {
                console.error("Error fetching genre series:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSeries();
    }, [genreName]);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#0f1014] text-white">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold tracking-widest text-red-600 animate-pulse">LOADING {genreName?.toUpperCase()}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f1014] pt-32 pb-20 px-6 md:px-16">
            <div className="flex flex-col mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-1 h-10 bg-red-600"></div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        {genreName} <span className="text-red-600">Collection</span>
                    </h1>
                </div>
                <p className="text-gray-400 max-w-2xl text-lg">
                    Discover the best {genreName} series handpicked for your entertainment.
                </p>
            </div>

            {series.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {series.map((item) => (
                        <MovieCard key={item.series_id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 text-center">
                    <h2 className="text-2xl font-bold text-gray-500 mb-4">No series found in this category yet.</h2>
                    <Link to="/home" className="text-red-600 font-bold hover:underline uppercase tracking-widest">
                        Back to Home
                    </Link>
                </div>
            )}
            
            <ScrollToTop />
        </div>
    );
};

export default GenrePage;
