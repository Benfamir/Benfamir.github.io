// reviews.js
const MovieReviewsAndWatchlist = () => {
    const [reviews, setReviews] = React.useState([]);
    const [watchlist, setWatchlist] = React.useState([]);
    const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'descending' });
    const [error, setError] = React.useState(null);
    const [selectedReview, setSelectedReview] = React.useState(null);
    const [page, setPage] = React.useState(1);
    const [searchTerm, setSearchTerm] = React.useState('');
    const reviewsPerPage = 20;

    React.useEffect(() => {
        const sheetId = '1KAFkfG8Q0j--wtUM152ZsBv-U6lzvh8xk_u4ObK7HGM';
        const reviewsSheetName = 'Sheet1';
        const watchlistSheetName = 'Sheet2';

        const fetchData = async (sheetName, setStateFunction) => {
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.text();
                const jsonData = JSON.parse(data.substring(47).slice(0, -2));
                
                const formattedData = jsonData.table.rows.map(row => {
                    if (sheetName === reviewsSheetName) {
                        return {
                            title: row.c[0] ? row.c[0].v : '',
                            benRating: row.c[1] ? parseFloat(row.c[1].v) : 0,
                            benThoughts: row.c[2] ? row.c[2].v : '',
                            benReRating: row.c[3] ? parseFloat(row.c[3].v) : null,
                            benReRatingReason: row.c[4] ? row.c[4].v : '',
                            lazaRating: row.c[5] ? parseFloat(row.c[5].v) : 0,
                            lazaThoughts: row.c[6] ? row.c[6].v : '',
                            lazaReRating: row.c[7] ? parseFloat(row.c[7].v) : null,
                            lazaReRatingReason: row.c[8] ? row.c[8].v : ''
                        };
                    } else {
                        return {
                            title: row.c[0] ? row.c[0].v : '',
                        };
                    }
                });

                setStateFunction(formattedData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            }
        };

        fetchData(reviewsSheetName, setReviews);
        fetchData(watchlistSheetName, setWatchlist);
    }, []);

    const sortReviews = (key) => {
        let direction = 'descending';
        if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    const getSortedReviews = React.useMemo(() => {
        let sortableReviews = [...reviews];
        if (sortConfig.key !== null) {
            sortableReviews.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableReviews;
    }, [reviews, sortConfig]);

    const filteredReviews = React.useMemo(() => {
        return getSortedReviews.filter(review =>
            review.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [getSortedReviews, searchTerm]);

    const paginatedReviews = filteredReviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage);

    const handleReviewClick = (review) => {
        setSelectedReview(review);
    };

    const closeModal = () => {
        setSelectedReview(null);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(1); // Reset to first page when searching
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Movie Reviews and Watch List</h1>
            
            <h2>Reviews</h2>
            <div className="search-and-sort">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <div className="sort-buttons">
                    <button onClick={() => sortReviews('benRating')}>
                        Sort by Ben's Ratings {sortConfig.key === 'benRating' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </button>
                    <button onClick={() => sortReviews('lazaRating')}>
                        Sort by Laza's Ratings {sortConfig.key === 'lazaRating' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                    </button>
                </div>
            </div>
            <div className="reviews-grid">
                {paginatedReviews.map((review, index) => (
                    <div key={index} className="review-card" onClick={() => handleReviewClick(review)}>
                        <h3>{review.title}</h3>
                        <p>Ben's Rating: {review.benRating}</p>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>Previous</button>
                <span>Page {page}</span>
                <button onClick={() => setPage(prev => prev + 1)} disabled={page * reviewsPerPage >= filteredReviews.length}>Next</button>
            </div>

            {selectedReview && (
    <div className="modal" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>&times;</button>
            <h2>{selectedReview.title}</h2>
            <div className="modal-body">
                <div className="review-section">
                    <h4>Ben's Rating: {selectedReview.benRating}</h4>
                    {selectedReview.benThoughts && <p>{selectedReview.benThoughts}</p>}
                    {selectedReview.benReRating && (
                        <div className="re-rating">
                            <h5>Re-rating: {selectedReview.benReRating}</h5>
                            <p>{selectedReview.benReRatingReason}</p>
                        </div>
                    )}
                </div>
                {selectedReview.lazaRating !== 0 && (
                    <div className="review-section">
                        <h4>Laza's Rating: {selectedReview.lazaRating}</h4>
                        {selectedReview.lazaThoughts && <p>{selectedReview.lazaThoughts}</p>}
                        {selectedReview.lazaReRating && (
                            <div className="re-rating">
                                <h5>Re-rating: {selectedReview.lazaReRating}</h5>
                                <p>{selectedReview.lazaReRatingReason}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
)}
            <h2>Watch List</h2>
            <ul className="watchlist">
                {watchlist.map((movie, index) => (
                    <li key={index}>{movie.title}</li>
                ))}
            </ul>
        </div>
    );
};

ReactDOM.render(<MovieReviewsAndWatchlist />, document.getElementById('reviews-container'));