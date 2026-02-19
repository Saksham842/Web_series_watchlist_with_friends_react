import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const response = await api.get(`/series/search?q=${query}`);
                setResults(response.data);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="min-h-screen bg-[#0f1014] text-white pt-28 px-6 md:px-16 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <div className="bg-red-600/20 p-3 rounded-2xl border border-red-600/30">
                        <Search className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                            Search Results
                        </h1>
                        <p className="text-gray-400 font-medium">
                            {loading ? 'Searching for...' : `Found ${results.length} results for`} 
                            <span className="text-white ml-2 font-bold italic">"{query}"</span>
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Hunting for series...</p>
                    </div>
                ) : results.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10"
                    >
                        {results.map((item, index) => (
                            <motion.div
                                key={item.series_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <MovieCard item={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                        <div className="text-6xl mb-6">🔍</div>
                        <h2 className="text-2xl font-bold mb-2">Oops! No series found.</h2>
                        <p className="text-gray-400">Try searching with different keywords or check for typos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
