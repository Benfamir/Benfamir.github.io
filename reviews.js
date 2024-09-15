// reviews.js
const MovieReviewsAndWatchlist = () => {
    const [reviews, setReviews] = React.useState([]);
    const [watchlist, setWatchlist] = React.useState([]);
    const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'descending' });
    const [error, setError] = React.useState(null);
    const [selectedReview, setSelectedReview] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterOption, setFilterOption] = React.useState('all');

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
                
                const formattedData = jsonData.table.rows
                    .filter((row, index) => index !== 0) // Filter out the first row (header)
                    .map(row => {
                        if (sheetName === reviewsSheetName) {
                            return {
                                title: row.c[0] ? row.c[0].v : '',
                                benRating: row.c[1] ? parseFloat(row.c[1].v) : null,
                                benThoughts: row.c[2] ? row.c[2].v : '',
                                benReRating: row.c[3] ? parseFloat(row.c[3].v) : null,
                                benReRatingReason: row.c[4] ? row.c[4].v : '',
                                lazaRating: row.c[5] ? parseFloat(row.c[5].v) : null,
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
                if (sortConfig.key === 'benRating' || sortConfig.key === 'lazaRating') {
                    return sortConfig.direction === 'ascending' 
                        ? (a[sortConfig.key] || 0) - (b[sortConfig.key] || 0)
                        : (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0);
                } else {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }
            });
        }
        return sortableReviews;
    }, [reviews, sortConfig]);

    const filteredReviews = React.useMemo(() => {
        return getSortedReviews.filter(review => {
            const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase());
            const hasBenReview = review.benThoughts && review.benThoughts.trim() !== '';
            const hasLazaReview = review.lazaThoughts && review.lazaThoughts.trim() !== '';

            switch (filterOption) {
                case 'withReviews':
                    return matchesSearch && (hasBenReview || hasLazaReview);
                case 'withoutReviews':
                    return matchesSearch && !hasBenReview && !hasLazaReview;
                case 'benReviews':
                    return matchesSearch && hasBenReview;
                case 'lazaReviews':
                    return matchesSearch && hasLazaReview;
                default:
                    return matchesSearch;
            }
        });
    }, [getSortedReviews, searchTerm, filterOption]);

    const recentReviews = reviews.slice(-5).reverse();

    const handleReviewClick = (review) => {
        setSelectedReview(review);
    };

    const closeModal = () => {
        setSelectedReview(null);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilterOption(event.target.value);
    };

    const getReviewClass = (review) => {
        const hasBenReview = review.benThoughts && review.benThoughts.trim() !== '';
        const hasLazaReview = review.lazaThoughts && review.lazaThoughts.trim() !== '';

        if (hasBenReview && hasLazaReview) {
            return 'both-review';
        } else if (hasBenReview) {
            return 'ben-review';
        } else if (hasLazaReview) {
            return 'laza-review';
        }
        return '';
    };

    const ColorKey = () => (
        <div className="color-key">
            <h3>Colour Key:</h3>
            <div className="key-item">
                <div className="key-color ben-review"></div>
                <span>Ben has written a review</span>
            </div>
            <div className="key-item">
                <div className="key-color laza-review"></div>
                <span>Laza has written a review</span>
            </div>
            <div className="key-item">
                <div className="key-color both-review"></div>
                <span>Both have written a review</span>
            </div>
            <div className="key-item">
                <div className="key-color"></div>
                <span>No written review</span>
            </div>
        </div>
    );

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="reviews-container">
            <h1>Movie Reviews and Watch List</h1>
            
            <h2>Recently Reviewed</h2>
            <div className="recent-reviews">
                {recentReviews.map((review, index) => (
                    <div key={index} className={`review-card ${getReviewClass(review)}`} onClick={() => handleReviewClick(review)}>
                        <h3>{review.title}</h3>
                        <p>Ben's Rating: {review.benRating !== null ? review.benRating : 'N/A'}</p>
                        <p>Laza's Rating: {review.lazaRating !== null ? review.lazaRating : 'N/A'}</p>
                    </div>
                ))}
            </div>

            <h2>All Reviews</h2>
            <ColorKey />
            <div className="search-and-sort">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <div className="filter-sort-container">
                    <select onChange={handleFilterChange} value={filterOption} className="filter-select">
                        <option value="all">All Movies</option>
                        <option value="withReviews">With Reviews</option>
                        <option value="withoutReviews">Without Reviews</option>
                        <option value="benReviews">Ben's Reviews</option>
                        <option value="lazaReviews">Laza's Reviews</option>
                    </select>
                    <div className="sort-buttons">
                        <button onClick={() => sortReviews('title')}>
                            Sort by Title {sortConfig.key === 'title' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </button>
                        <button onClick={() => sortReviews('benRating')}>
                            Sort by Ben's Ratings {sortConfig.key === 'benRating' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </button>
                        <button onClick={() => sortReviews('lazaRating')}>
                            Sort by Laza's Ratings {sortConfig.key === 'lazaRating' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>
            </div>
            <div className="reviews-scroll-container">
                <div className="reviews-grid">
                    {filteredReviews.map((review, index) => (
                        <div key={index} className={`review-card ${getReviewClass(review)}`} onClick={() => handleReviewClick(review)}>
                            <h3>{review.title}</h3>
                            <p>Ben's Rating: {review.benRating !== null ? review.benRating : 'N/A'}</p>
                            <p>Laza's Rating: {review.lazaRating !== null ? review.lazaRating : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </div>

            {selectedReview && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-button" onClick={closeModal}>&times;</button>
                        <h2>{selectedReview.title}</h2>
                        <div className="modal-body">
                            <div className="review-section">
                                <h4>Ben's Rating: {selectedReview.benRating !== null ? selectedReview.benRating : 'N/A'}</h4>
                                {selectedReview.benThoughts ? (
                                    <p>{selectedReview.benThoughts}</p>
                                ) : (
                                    <p>No written review available.</p>
                                )}
                                {selectedReview.benReRating !== null && (
                                    <div className="re-rating">
                                        <h5>Re-rating: {selectedReview.benReRating}</h5>
                                        <p>{selectedReview.benReRatingReason || 'No reason provided.'}</p>
                                    </div>
                                )}
                            </div>
                            <div className="review-section">
                                <h4>Laza's Rating: {selectedReview.lazaRating !== null ? selectedReview.lazaRating : 'N/A'}</h4>
                                {selectedReview.lazaThoughts ? (
                                    <p>{selectedReview.lazaThoughts}</p>
                                ) : (
                                    <p>No written review available.</p>
                                )}
                                {selectedReview.lazaReRating !== null && (
                                    <div className="re-rating">
                                        <h5>Re-rating: {selectedReview.lazaReRating}</h5>
                                        <p>{selectedReview.lazaReRatingReason || 'No reason provided.'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="watchlist-section">
                <h2>Watch List</h2>
                <div className="watchlist-grid">
                    {watchlist.map((movie, index) => (
                        <div key={index} className="watchlist-item">{movie.title}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Render the React component
ReactDOM.render(<MovieReviewsAndWatchlist />, document.getElementById('reviews-container'));