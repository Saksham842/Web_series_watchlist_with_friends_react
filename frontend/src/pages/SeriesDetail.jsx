import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Row from '../components/Row';
import { Play, Plus, Check } from 'lucide-react';

const SeriesDetail = () => {
    const { id } = useParams();
    const [series, setSeries] = useState(null);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(null);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const response = await api.get(`/series/${id}`);
                setSeries(response.data.series);
                setRecommended(response.data.recommended);
                if (response.data.series.seasons.length > 0) {
                    setSelectedSeason(response.data.series.seasons[0]);
                }
                
                // Check watchlist status (simplified for now, ideally backend returns this)
                const watchlistRes = await api.get('/watchlist');
                const isAdded = watchlistRes.data.some(item => item.series_id === parseInt(id));
                setInWatchlist(isAdded);

            } catch (error) {
                console.error("Error fetching series details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
        window.scrollTo(0,0);
    }, [id]);

    const handleWatchlist = async () => {
        try {
            if (inWatchlist) {
                await api.delete(`/watchlist/delete/${id}`);
                setInWatchlist(false);
            } else {
                await api.post('/watchlist/add', { series_id: id });
                setInWatchlist(true);
            }
        } catch (error) {
            console.error("Error updating watchlist:", error);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#141414] text-white">Loading...</div>;
    if (!series) return <div className="h-screen flex items-center justify-center bg-[#141414] text-white">Series not found</div>;

    return (
        <div className="bg-[#141414] min-h-screen pb-20 text-white">
             {/* Hero Section */}
             <div 
                className="relative h-[60vh] md:h-[80vh] bg-cover bg-center"
                style={{ backgroundImage: `url(${series.landscape_poster_url || series.poster_url})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent"></div>
                <div className="absolute bottom-10 left-8 md:left-16 max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">{series.title}</h1>
                    <div className="flex items-center gap-4 mb-6 text-sm md:text-base text-gray-300">
                        <span className="text-green-400 font-bold">{series.series_rating} Match</span>
                        <span>{series.release_year}</span>
                        <span className="border border-gray-500 px-1 text-xs">{series.genre_name}</span>
                    </div>
                    
                    <div className="flex gap-4 mb-6">
                        <button className="bg-white text-black px-8 py-2 md:py-3 rounded font-bold flex items-center gap-2 hover:bg-opacity-80 transition-all">
                            <Play className="fill-black w-5 h-5" /> Play
                        </button>
                        <button 
                            onClick={handleWatchlist}
                            className="bg-gray-500/70 text-white px-8 py-2 md:py-3 rounded font-bold flex items-center gap-2 hover:bg-gray-500/50 transition-all backdrop-blur-sm"
                        >
                            {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {inWatchlist ? 'My List' : 'Add to List'}
                        </button>
                    </div>

                    <p className="text-lg text-gray-200 line-clamp-3 md:line-clamp-none max-w-3xl">
                        {series.summary}
                    </p>
                </div>
            </div>

            {/* Seasons & Episodes */}
            <div className="px-8 md:px-16 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Episodes</h2>
                    {series.seasons.length > 0 && (
                        <select 
                            className="bg-black border border-gray-700 text-white py-2 px-4 rounded"
                            onChange={(e) => setSelectedSeason(series.seasons.find(s => s.season_id === parseInt(e.target.value)))}
                            value={selectedSeason?.season_id}
                        >
                            {series.seasons.map(season => (
                                <option key={season.season_id} value={season.season_id}>
                                    {season.title || `Season ${season.number}`}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                
                <div className="flex flex-col gap-4 max-w-4xl border-t border-gray-800 pt-6">
                    {selectedSeason?.episodes.map((ep, idx) => (
                        <div key={ep.episode_id} className="flex gap-4 p-4 hover:bg-[#333] rounded transition-colors group cursor-pointer border-b border-gray-800 last:border-0">
                            <div className="text-2xl text-gray-500 font-bold self-center w-8">{idx + 1}</div>
                            <div className="relative min-w-[120px] h-[70px] bg-gray-700 rounded overflow-hidden">
                                {series.landscape_poster_url && (
                                     <img src={series.landscape_poster_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                )}
                                <Play className="absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <h3 className="font-bold text-base">{ep.title}</h3>
                                    <span className="text-sm text-gray-400">{new Date(ep.air_date).getFullYear()}</span>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-2">{ep.overview}</p>
                            </div>
                        </div>
                    ))}
                    {selectedSeason?.episodes.length === 0 && (
                        <div className="text-gray-500">No episodes available for this season.</div>
                    )}
                </div>
            </div>

            {/* Recommendations */}
            <div className="mt-12">
                <Row title="More Like This" data={recommended} />
            </div>
        </div>
    );
};

export default SeriesDetail;
