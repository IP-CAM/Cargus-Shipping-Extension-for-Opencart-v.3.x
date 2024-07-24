// cargus-widget.js
/*
 * Cargus Map Widget v1.0.0
 * Author: Tremend
 * Description: This widget provides a map interface for selecting pudo-points.
 */

/** Loading screen */
function initializeCargus(mapContainerId, FnParams, VarParams ) {

    CargusMapWidget(mapContainerId, FnParams, VarParams )

    function CargusMapWidget(mapContainerId, FnParams, VarParams ) {

		// ============================================

		const fetch_data = FnParams.fetch_data
		const ChooseMarker = FnParams.ChooseMarker
		const assets_path = VarParams.assets_path
		const dbName = VarParams.dbName || 'pudoStorage';
		const customKeyMapping = VarParams.customKeyMapping;
		const USE_DEFAULT_MAPPING = VarParams.USE_DEFAULT_MAPPING;
		const DEFAULT_COORDINATES = VarParams.DEFAULT_COORDINATES || {
			latitude: 44.42721425196829,
			longitude: 26.102416039867997,
			};		  

		const closeModal = FnParams.closeModal;

		// ============================================

		var mapWidgetContainer = document.getElementById(mapContainerId);

		var mapWidgetHTML = generateMapWidgetHTML();

		mapWidgetContainer.appendChild(mapWidgetHTML);
		
		var list;
		let map;
		let markersLayer;
		let locationsData;
		let zoomSnap = 0.25;
		let zoomDelta = 0.01;
		let wheelPxPerZoomLevel = 300;
		let visibleMarkerIDs = [];
		let isMarkerVisible;
		
		const objectStoreName = 'locations';

		// Location
		
		const pointPinIcon = L.icon({
			iconUrl: assets_path + '/pointpin.png',
			iconSize: [64, 64],
		});
		const lockerPinIcon = L.icon({
			iconUrl: assets_path + '/lockerpin.png',
			iconSize: [64, 64],
		});
		const selectedPointPinIcon = L.icon({
			iconUrl: assets_path + '/spointpin.png',
			iconSize: [64, 64],
		});
		const selectedLockerPinIcon = L.icon({
			iconUrl: assets_path + '/slockerpin.png',
			iconSize: [64, 64],
		});
		
		const searchBox = document.getElementById('cargus-search-box');
		const closeSearchBox = document.getElementById('cargus-search-reset-button')
		const clearButton = document.getElementById('cargus-clear-btn');
		const resultContainer = document.getElementById('cargus-search-results-container');
		const listContainer = document.querySelector('#cargus-listContainer');
		const searchBar = document.querySelector('#cargus-search-container');
		const lockerCheckbox = document.getElementById('cargus-locker-checkbox');
		const shopCheckbox = document.getElementById('cargus-shop-checkbox');
		const sidebar = document.getElementById('cargus-sidebar');

		/**
		 * Creates a loading screen and appends it to the specified target element.
		 * @param {HTMLElement} targetElement - The element to which the loading screen will be appended.
		 */

		
		function flattenAndMapKeys(inputObj, keyMapping) {
			function recursiveFlatten(obj, parentKey = "") {
			return Object.keys(obj).reduce((acc, key) => {
				const lowercaseKey = key.toLowerCase();
				const newKey = Object.keys(keyMapping).find(mappedKey => mappedKey.toLowerCase() === lowercaseKey);
				const mappedValue = keyMapping[newKey] || key; // Use the matched key or the original key if not found
				const newParentKey = parentKey ? `${parentKey}_${mappedValue}` : mappedValue;
				if (typeof obj[key] === 'object' && obj[key] !== null) {
					Object.assign(acc, recursiveFlatten(obj[key], newParentKey));
				} else {
					acc[newParentKey] = obj[key];
				}
				return acc;
			}, {});
			}
			return recursiveFlatten(inputObj);
			}
	

		function flattenJSON(obj, parentKey = '') {

			if( USE_DEFAULT_MAPPING ) {
				return obj;
			}

			let result = {};
			for (let key in obj) {
				if (obj.hasOwnProperty(key)) {
					const newKey = parentKey + key.toLowerCase();
					if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
						Object.assign(result, flattenJSON(obj[key], newKey + '_'));
					} else {
						result[newKey] = obj[key];
					}
				}
			}
			result = flattenAndMapKeys(result, customKeyMapping)
			return result;
		}
			

		function once(fn) {
			let hasBeenCalled = false;
			let result;
			return function(...args) {
				if(!hasBeenCalled) {
					hasBeenCalled = true;
					result = fn.apply(this, args);
				}
				return result;
			};
		}
		
		const debounce = (func, delay) => {
			let timeoutId;
			// Return a function with a delay before executing the original function
			return(...args) => {
				clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					func(...args);
				}, delay);
			};
		};

		/**
		 * Creates a loading screen and appends it to the specified target element.
		 * @param {HTMLElement} targetElement - The element to which the loading screen will be appended.
		 */
		function createLoadingScreen(targetElement) {
			// Create the main container for the loading screen
			const modal = document.createElement("div");
			modal.className = "cargus-loading-screen-modal";
			// Create the loading animation element (loading circle)
			const loadingCircle = document.createElement("div");
			loadingCircle.className = "cargus-loading-circle";
			// Append the loading animation to the main container
			modal.appendChild(loadingCircle);
			// Append the main container (loading screen) to the target element
			targetElement.appendChild(modal);
		}

		function showLoadingScreen() {
			const targetElement = document.getElementById("cg-map-widget-container");
			if(targetElement) {
				const mapElement = document.querySelector(".cargus-map-widget #map");
				const sidebarElement = document.querySelector(".cargus-map-widget .sidebar");
				sidebarElement.style.opacity = "0.4";
				mapElement.style.opacity = "0.4";
				createLoadingScreen(targetElement);
			}
		}

		function hideLoadingScreen() {
			const modal = document.querySelector(".cargus-loading-screen-modal");
			if(modal) {
				const mapElement = document.querySelector(".cargus-map-widget #map");
				const sidebarElement = document.querySelector(".cargus-map-widget .sidebar");
				sidebarElement.style.opacity = "1";
				mapElement.style.opacity = "1";
				modal.remove();
			}
		}

		function handleMobileMenu() {
			const markedResultExtendedCard = document.querySelector('#cargus-markedResult .extended-card');
			if(window.screen.availWidth < 769 && markedResultExtendedCard !== null) {
				listContainer.style.setProperty('display', 'none', 'important');
				searchBar.style.setProperty('display', 'none', 'important');
			} else {
				const listContainer = document.querySelector('.results');
				searchBar.style.setProperty('display', 'block', 'important');
				listContainer.style.filter = 'blur(0px)';
			}
		}

		function generateMapWidgetHTML() {
			const mapWidgetContainer = document.createElement("div");
			mapWidgetContainer.classList.add("cg-map-widget-container");
			mapWidgetContainer.classList.add("cargus-map-widget");
			mapWidgetContainer.id = "cg-map-widget-container";
			mapWidgetContainer.innerHTML = `
				<span id="close-modal"> X </span>
				<div class="sidebar" id="cargus-sidebar">
					<div class="search" id="cargus-query-container">
						<div id="cargus-search-container">
							<button id="cargus-clear-btn" style="display: none;">&times;</button>
							<div class="search-container">
							<input type="text" class="search-box" id="cargus-search-box" placeholder="Search...">
							<span id="cargus-search-reset-button"> x </span>
							</div>
							<div class="cargus-filter">
								<div id="cargus-checkbox-container">
									<label><input type="checkbox" id="cargus-locker-checkbox" checked> Locker</label>
									<label><input type="checkbox" id="cargus-shop-checkbox" checked> Shop</label>
								</div>
							</div>
						</div>
							<div id="cargus-search-results-container"></div>
					</div>
					<div class="results" id="cargus-search-results">
						<div class="MapContainer" id="cargus-markedResult"> </div>
						<div id="cargus-listContainer">
							<ul id="pointList"></ul>
						</div>
					</div>
				</div>
				<div id="cargus-map-wrapper">
				<div id="map"></div>
				</div>
			`;
			document.addEventListener('DOMContentLoaded', () => {
				const clearBtn = document.getElementById('cargus-clear-btn');
				const searchBox = document.getElementById('cargus-search-box');
				if (clearBtn && searchBox) {
					clearBtn.addEventListener('click', (event) => {
					event.preventDefault(); // Prevent the default behavior of the click event
					searchBox.value = '';
					clearBtn.style.display = 'none';
					});
				
					searchBox.addEventListener('input', () => {
					clearBtn.style.display = searchBox.value ? 'block' : 'none';
					});
				}
				});			  
			return mapWidgetContainer;
		}

		/**
		 * Class representing a Schedule Generator.
		 * Generates formatted opening hours schedule based on provided data.
		 */

		class ScheduleGenerator {
			/**
			 * Construct a new ScheduleGenerator instance.
			 * @param {Object} data - The data containing opening hours for different days.
			 */
			constructor(data) {
					this.data = data; // The data containing opening hours
					this.daysOfWeek = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata', 'Duminica']; // List of days
				}
				/**
				 * Get the opening hours for a specific day.
				 * @param {string} day - The day of the week.
				 * @param {string} startKey - The key for the start opening hour in the data.
				 * @param {string} endKey - The key for the end opening hour in the data.
				 * @returns {Object} The day and its corresponding opening hours.
				 */
			getDayOpenHours(day, startKey, endKey) {
					return {
						day: day,
						start: this.data[startKey] || null,
						end: this.data[endKey] || null,
					};
				}
				/**
				 * Get the formatted opening hours for a specific interval of days.
				 * @param {Object} startDay - The starting day's opening hours.
				 * @param {Object} endDay - The ending day's opening hours.
				 * @returns {string} Formatted opening hours for the specified interval of days.
				 */
			getOpenHours(startDay, endDay) {
					if(startDay.day === endDay.day) {
						if(startDay.start && startDay.end) {
							return `${startDay.day}: ${startDay.start}-${startDay.end}`;
						} else {
							return `${startDay.day}: Inchis`;
						}
					} else {
						if(startDay.start && startDay.end) {
							return `${startDay.day}-${endDay.day}: ${startDay.start}-${startDay.end}`;
						} else {
							return `${startDay.day}-${endDay.day}: Inchis`;
						}
					}
				}
				/**
				 * Generate the formatted opening hours schedule.
				 * @returns {string} The formatted opening hours schedule.
				 */
			generateSchedule() {
				const listOfDays = [];
				listOfDays.push(this.getDayOpenHours("Luni", "OpenHoursMoStart", "OpenHoursMoEnd"));
				listOfDays.push(this.getDayOpenHours("Marti", "OpenHoursTuStart", "OpenHoursTuEnd"));
				listOfDays.push(this.getDayOpenHours("Miercuri", "OpenHoursWeStart", "OpenHoursWeEnd"));
				listOfDays.push(this.getDayOpenHours("Joi", "OpenHoursThStart", "OpenHoursThEnd"));
				listOfDays.push(this.getDayOpenHours("Vineri", "OpenHoursFrStart", "OpenHoursFrEnd"));
				listOfDays.push(this.getDayOpenHours("Sambata", "OpenHoursSaStart", "OpenHoursSaEnd"));
				listOfDays.push(this.getDayOpenHours("Duminica", "OpenHoursSuStart", "OpenHoursSuEnd"));
				let result = '';
				let firstIntervalDay = undefined;
				let lastIntervalDay = undefined;
				listOfDays.forEach((day) => {
					if(firstIntervalDay === undefined) {
						firstIntervalDay = day;
					}
					if(lastIntervalDay === undefined) {
						lastIntervalDay = day;
					}
					if(firstIntervalDay.start !== day.start || firstIntervalDay.end !== day.end) {
						result += this.getOpenHours(firstIntervalDay, lastIntervalDay).replace(/\n/g, '<br>') + '<br>';
						firstIntervalDay = day;
						lastIntervalDay = day;
					} else {
						lastIntervalDay = day;
					}
				});
				// for the last day
				result += this.getOpenHours(firstIntervalDay, lastIntervalDay).replace(/\n/g, '<br>') + '<br>';
				return result.trim();
			}
		}

		/**
		 * Class representing a Pointer Tracker.
		 * Tracks and manages the location and associated information of a selected PUDO point on map.
		 */
		class PointerTracker {
			/**
			 * Construct a new PointerTracker instance.
			 * Initializes the pointer's ID, latitude, and longitude.
			 */
			constructor() {
					this.pointerID = null; // ID of the tracked pointer
					this.latitude = null; // Latitude of the pointer's location
					this.longitude = null; // Longitude of the pointer's location
				}
				/**
				 * Set the ID of the tracked pointer and update its location information.
				 * @param {number} id - The ID of the pointer.
				 */
			set(id) {
					this.pointerID = id;
					const location = getLocationObject(id);
					if(location) {
						this.latitude = location.Latitude;
						this.longitude = location.Longitude;
					}
				}
				/**
				 * Get the icon associated with the tracked pointer.
				 * @param {boolean} selected - Whether the pointer is selected.
				 * @returns {string|null} The URL of the associated icon, or null if not found.
				 */
			getAssociatedIcon(selected = false) {
					const location = getLocationObject(this.pointerID);
					if(!location) {
						return null;
					}
					const pointType = location.PointType;
					let icon = null;
					// Current API Response returns values bigger than 50 for Lockers
					if(pointType < 50) {
						icon = selected ? selectedPointPinIcon : pointPinIcon;
					} else {
						icon = selected ? selectedLockerPinIcon : lockerPinIcon;
					}
					return icon.options.iconUrl;
				}
				/**
				 * Set the location of the tracked pointer.
				 * @param {number} latitude - The new latitude.
				 * @param {number} longitude - The new longitude.
				 */
			setPointerLocation(latitude, longitude) {
					this.latitude = latitude;
					this.longitude = longitude;
				}
				/**
				 * Get the ID of the tracked pointer.
				 * @returns {number|null} The ID of the pointer.
				 */
			getPointerID() {
					return this.pointerID;
				}
				/**
				 * Get the location of the tracked pointer.
				 * @returns {Object} The latitude and longitude of the pointer's location.
				 */
			getPointerLocation() {
					return {
						latitude: this.latitude,
						longitude: this.longitude
					};
				}
				/**
				 * Clear the ID and location information of the tracked pointer.
				 */
			clearPointerID() {
				this.pointerID = null;
				this.latitude = null;
				this.longitude = null;
			}
		}
		const pointerTracker = new PointerTracker();

		/**
		 * A class for handling reactivity based on screen size and container content.
		 */
		class Reactivity {

			// id listContainer is reponsible for displaying results seen on map
			// id search-results container is responsible for displaying results from search query
			// id cargus-sidebar container is responsible for entire search container
			constructor() {
				this.results_from_map_container = document.querySelector('#cargus-listContainer');
				this.results_from_search_container = document.getElementById('cargus-search-results-container');
				this.sidebar = document.getElementById('cargus-sidebar');
				this.search_container = document.getElementById('cargus-search-results');
				this.query_container = document.getElementById('cargus-query-container');
				this.markedContainer = document.getElementById('cargus-markedResult');
			}

			isMobile() {
				return window.innerWidth <= 768; // Adjust the threshold as needed
			}

			isDesktop() {
				return window.innerWidth > 768;
			}

			// Sunt elemente in search query
			isDisplayedResultsEmpty() {
				if(this.results_from_map_container.querySelectorAll('div').length > 0 ) {
					return true;
				} else {
					return false;
				}
			}

			isAnyMarkerSelected() {
				if(pointerTracker.getPointerID()) {
					return true;
				} else {
					return false;
				}
			}

			isSearchContainerEmpty() {
		
				if(this.results_from_search_container.childElementCount > 0 ) {
					return true;
				} else {
					return false;
				}
			}

			apply() {

				if(this.isMobile()) {
	
					if(this.isAnyMarkerSelected()) {
						this.query_container.style.height = 'unset';
					}

					if(this.isDisplayedResultsEmpty() && !this.isSearchContainerEmpty() ) {
						this.results_from_map_container.style.filter = 'blur(0px)';
						this.search_container.style.height = '100%';
						this.results_from_map_container.style.height = '100%';
						this.sidebar.style.height = '100%';
						this.query_container.style.height = 'unset';
					}

					if(!this.isDisplayedResultsEmpty() && this.isSearchContainerEmpty() ) {
						this.search_container.style.height = '0';
						this.query_container.style.height = '100%';
					}

					if(this.isDisplayedResultsEmpty() && this.isSearchContainerEmpty() ) {
						this.results_from_map_container.style.filter = 'blur(3px)';
						this.search_container.style.height = '0';
						this.query_container.style.height = '100%';
					}

					if(!this.isDisplayedResultsEmpty() && !this.isSearchContainerEmpty() && !this.isAnyMarkerSelected) {
						this.search_container.style.height = 'unset';
						// map.invalidateSize();
					}

					if(!this.isDisplayedResultsEmpty() && !this.isSearchContainerEmpty() && this.isAnyMarkerSelected) {
						this.search_container.style.height = 'unset';
						// map.invalidateSize();
					}

					if(this.isAnyMarkerSelected() && this.isSearchContainerEmpty()) {
						this.query_container.style.height = 'unset';
					}

				}
				if(this.isDesktop()) {
					if(this.isDisplayedResultsEmpty() && this.isSearchContainerEmpty() ) {
						this.results_from_map_container.style.display = 'none';
						this.results_from_map_container.style.filter = 'blur(3px)';
					}
					if(this.isDisplayedResultsEmpty() && !this.isSearchContainerEmpty() ) {
						this.results_from_map_container.style.display = 'block';
						this.results_from_map_container.style.filter = 'blur(0px)';
					}
					if(this.isAnyMarkerSelected() && !this.isSearchContainerEmpty()) {
						this.markedContainer.style.filter='blur(0px)';
					}

					if( this.isAnyMarkerSelected() && this.isSearchContainerEmpty()) {
						this.markedContainer.style.filter='blur(3px)';
					}
				}
			}

		}
		
		var targetSearchResults = document.getElementById('cargus-search-results-container');
		var targetListContainer = document.getElementById('cargus-listContainer');

		// Create a new instance of MutationObserver
		var observer = new MutationObserver(function(mutations) {
			// Clear any existing timeout
			clearTimeout(observer.timeout);
			// Set a new timeout to call reactivity() after a short delay
			observer.timeout = setTimeout(function() {
				reactivity.apply();
			}, 100); // Adjust the delay as needed
		});
		// Configuration of the observer
		var config = {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true
		};
		// Start observing the target nodes
		observer.observe(targetSearchResults, config);
		observer.observe(targetListContainer, config);
		/**
		 * Handles the click event on a marker or marker ID.
		 * Updates pointer tracking and marker visibility accordingly.
		 * @param {Object|string} eventOrId - The click event object or a marker ID.
		 */
		function handleMarkerClick(eventOrId) {
			let markerId;
			// Determine the marker ID from the event or provided ID
			if(typeof eventOrId === 'object' && eventOrId.target.options) {
				markerId = eventOrId.target.options.Id;
			} else {
				markerId = eventOrId;
			}
			// Check if the clicked marker is the currently tracked pointer
			if(pointerTracker.getPointerID() && pointerTracker.getPointerID() == markerId) {
				// Clear the tracked pointer ID and update marker visibility
				pointerTracker.clearPointerID();
				updateMarkers();
			} else {
				// Set the clicked marker as the tracked pointer
				pointerTracker.set(markerId);
				const {
					latitude, longitude
				} = pointerTracker.getPointerLocation();
				GoTo(latitude, longitude, 14); // Navigate to the pointer's location
				const listContainer = document.querySelector('.results');
				listContainer.style.filter = 'blur(0px)'; // Remove blur effect from the results container
			}
			clearSearch();
		}

		const reactivity = new Reactivity();

		/**
		 * Redirects to Google Maps for navigation from the starting location to a specified destination.
		 * @param {number} latitude - The latitude of the destination.
		 * @param {number} longitude - The longitude of the destination.
		 */
		function redirectToGoogleMaps(latitude, longitude) {
			// Retrieve your actual coordinates from GPS_COORDINATES object
			const startingLatitude = DEFAULT_COORDINATES.latitude;
			const startingLongitude = DEFAULT_COORDINATES.longitude;
			// Construct the Google Maps URL with the starting point and destination
			const googleMapsUrl = `https://www.google.com/maps/dir/${startingLatitude},${startingLongitude}/${latitude},${longitude}`;
			// Open a new window with the Google Maps URL
			window.open(googleMapsUrl, '_blank');
		}
		/**
		 * Retrieves the actual coordinates using the Geolocation API.
		 * @returns {Promise<Object>} A Promise that resolves with an object containing the latitude and longitude.
		 */
		function getActualCoordinates() {
			return new Promise((resolve) => {
				// Check if Geolocation API is available
				if(!navigator.geolocation) {
					resolve(DEFAULT_COORDINATES); // Return default coordinates if unavailable
				}
				// Get the current position using Geolocation API
				navigator.geolocation.getCurrentPosition(
					(position) => {
						// Extract latitude and longitude from the position
						const latitude = position.coords.latitude;
						const longitude = position.coords.longitude;
						// Update GPS_COORDINATES object
						DEFAULT_COORDINATES.latitude = latitude;
						DEFAULT_COORDINATES.longitude = longitude;
						// Resolve the promise with the retrieved coordinates
						resolve({
							latitude,
							longitude
						});
					}, (error) => {
						resolve(DEFAULT_COORDINATES); // Return default coordinates on error
					});
			});
		}
		/**
		 * Adjusts the map view to a specified latitude and longitude.
		 * @param {number} latitude - The latitude of the location to navigate to.
		 * @param {number} longitude - The longitude of the location to navigate to.
		 * @param {number} [zoomLevel=12] - The zoom level of the map (default is 12).
		 * @returns {Array} An array of viewable layers on the map.
		 */
		function GoTo(latitude, longitude, zoomLevel = 12) {
			const viewable_layers = [];
			if(map) {
				// Set the view of the map to the specified coordinates and zoom level
				map.setView([latitude, longitude], zoomLevel);
				// Listen for the 'moveend' event to capture viewable layers
				map.on('moveend', function() {
					map.eachLayer(function(layer) {
						viewable_layers.push(layer);
					});
				});
			}
			return viewable_layers; // Return the array of viewable layers
		}
		/**
		 * Retrieves a location object from the locations data based on the provided ID.
		 * @param {number} id - The ID of the location to retrieve.
		 * @returns {Object|null} The retrieved location object, or null if not found.
		 */
		function getLocationObject(id) {
			// Filter locations data to find the matching location based on the ID
			const filteredLocations = locationsData.filter(location => location.Id === id);
			// Return the first matching location object or null if not found
			return filteredLocations.length > 0 ? filteredLocations[0] : null;
		}
		/**
		 * Fetches location data from a JSON source, updates the IndexedDB with the new data,
		 * and triggers the update of markers on the map.
		 */
		const fetchAndUpdateLocations = async() => {

			try {
				// Show loading screen during the process
				showLoadingScreen();
				// Open the IndexedDB database
				const db = await openDatabase();
				// Fetch location data from the provided JSON path
				
				const response = await fetch_data();
				
				const jsonData = await response.json();
				// Begin a transaction to update the object store
				const transaction = db.transaction([objectStoreName], 'readwrite');
				const objectStore = transaction.objectStore(objectStoreName);
				// Clear existing data in the object store
				const clearRequest = objectStore.clear();
				clearRequest.onsuccess = (event) => {
					// Add each location from the fetched JSON data to the object store
					jsonData.forEach(location => {
						objectStore.add(flattenJSON(location));
					});
					// Complete the transaction and handle success
					transaction.oncomplete = (event) => {
						hideLoadingScreen();
						// Retrieve the updated data from IndexedDB and update markers
						retrieveDataFromDatabase(db).then(updatedData => {
							locationsData = updatedData;
							updateMarkers();
							map.on('moveend', updateMarkers);
						}).catch(error => {
							console.error('Error retrieving updated data:', error);
						});
					};
					// Handle transaction errors
					transaction.onerror = (event) => {
						console.error('Transaction error:', event.target.error);
					};
				};
				// Handle clear request errors
				clearRequest.onerror = (event) => {
					console.error('Clear request error:', event.target.error);
				};
			} catch(error) {
				console.error('Error fetching or updating location data:', error);
			}
		};
		// Fetch actual coordinates using the getActualCoordinates function
		getActualCoordinates().then(coordinates => {
			// Destructure latitude and longitude from the retrieved coordinates or use default
			const {
				latitude, longitude
			} = coordinates || DEFAULT_COORDINATES;
			// Set initial zoom level
			var initialZoom = 10;
			if(coordinates) {
				initialZoom = 16;
			}
			// Initialize the map with the determined coordinates and initialZoom
			initMap({
				latitude,
				longitude,
				initialZoom
			});
		});
		/**
		 * Opens an IndexedDB database, creating or upgrading the object store if needed.
		 * Fetches JSON data and stores it in the database during the upgrade process.
		 * @returns {Promise<IDBDatabase>} A Promise that resolves with the opened database instance.
		 */
		const openDatabase = () => {
			return new Promise((resolve, reject) => {
				// Open or create the indexedDB database
				const request = indexedDB.open(dbName);
				// Handle the upgrade needed event
				request.onupgradeneeded = (event) => {
					const db = event.target.result;
					// Create object store if not already present
					if(!db.objectStoreNames.contains(objectStoreName)) {
						const objectStore = db.createObjectStore(objectStoreName, {
							keyPath: 'id',
							autoIncrement: true
						});
						// Create an index if needed
						objectStore.createIndex('locationIndex', 'location');
					}
					// Fetch JSON data and store it in the object store
					const transaction = event.target.transaction;
					const objectStore = transaction.objectStore(objectStoreName);
					fetch_data().then(response => response.json()).then(data => {
						data.forEach(location => objectStore.add(flattenJSON(location)));
					}).catch(error => reject(error));
				};
				// Handle the success event
				request.onsuccess = () => {
					const db = request.result;
					resolve(db); // Resolve the Promise with the opened database instance
				};
				// Handle the error event
				request.onerror = (event) => {
					reject(event.target.error); // Reject the Promise with the error
				};
			});
		};
		/**
		 * Retrieves data from an IndexedDB database using a read-only transaction.
		 * @param {IDBDatabase} db - The IndexedDB database instance.
		 * @returns {Promise<Array>} A Promise that resolves with the retrieved data array.
		 */
		const retrieveDataFromDatabase = (db) => {
			return new Promise((resolve, reject) => {
				// Begin a read-only transaction
				const transaction = db.transaction([objectStoreName], 'readonly');
				const objectStore = transaction.objectStore(objectStoreName);
				// Request to retrieve all data from the object store
				const retrieveRequest = objectStore.getAll();
				// Handle the success event
				retrieveRequest.onsuccess = (event) => {
					resolve(event.target.result); // Resolve the Promise with the retrieved data array
				};
				// Handle the error event
				retrieveRequest.onerror = (event) => {
					reject(event.target.error); // Reject the Promise with the error
				};
			});
		};
		/**
		 * Returns a debounced version of a function that delays its execution until after a specified delay.
		 * @param {Function} func - The function to be debounced.
		 * @param {number} delay - The delay in milliseconds before the function is executed.
		 * @returns {Function} The debounced function.
		 */

		const updateMarkers = () => {
			if(map && document.getElementById('cargus-locker-checkbox') && document.getElementById('cargus-shop-checkbox')) {
				const bounds = map.getBounds();
				const lockerCheckbox = document.getElementById('cargus-locker-checkbox');
				const shopCheckbox = document.getElementById('cargus-shop-checkbox');
				// Open IndexedDB database
				const request = indexedDB.open(dbName);
				request.onsuccess = (event) => {
					const db = event.target.result;
					const transaction = db.transaction([objectStoreName], 'readonly');
					const objectStore = transaction.objectStore(objectStoreName);
					const visibleMarkers = [];
					objectStore.openCursor().onsuccess = (event) => {
						const cursor = event.target.result;
						if(cursor) {
							const location = cursor.value;
							const {
								ID,
								Latitude,
								Longitude,
								PointType
							} = location;
							const point = turf.point([Longitude, Latitude], {
								LocationID: ID
							});
							const boundsPolygon = turf.bboxPolygon([
								bounds.getWest(),
								bounds.getSouth(),
								bounds.getEast(),
								bounds.getNorth()
							]);
							isMarkerVisible = turf.booleanPointInPolygon(point, boundsPolygon);
							const isShop = PointType < 50;
							const isLocker = PointType >= 50;
							const isPreviousSelected = location.Id === pointerTracker.getPointerID();
	
							const showLocker = lockerCheckbox.checked && isLocker;
							const showShop = shopCheckbox.checked && isShop;
							const shouldShowMarker = showLocker || showShop;
							if((isMarkerVisible && shouldShowMarker) || isPreviousSelected) {
								visibleMarkers.push(location);
							}
							cursor.continue();
						} else {
							// All markers processed, update the map with visibleMarkers array
							navbar_updatePointList(visibleMarkers);
							const markerGroup = createMarkers(visibleMarkers);
							if(markersLayer) {
								markersLayer.clearLayers();
								markersLayer.addLayer(markerGroup);
							} else {
								markersLayer = markerGroup;
								map.addLayer(markersLayer);
							}
						}
					};
				};
			}
		};
		const createMarkers = locations => {
			const markers = locations.map(location => {
				const {
					Id,
					Latitude,
					Longitude,
					Name,
					PointType,
					isSelected
				} = location;
				const icon = PointType < 50 ? pointPinIcon : lockerPinIcon;
				if(pointerTracker.getPointerID() && pointerTracker.getPointerID() == Id) {
					const marker = L.canvasMarker([Latitude, Longitude], {
						radius: 20,
						Id,
						img: {
							url: pointerTracker.getAssociatedIcon(true),
							size: [35, 35], //image size ( default [40, 40] )
							rotate: 0, //image base rotate ( default 0 )
							offset: {
								x: 0,
								y: 0
							}, //image offset ( default { x: 0, y: 0 } )
						},
					}).on('click', handleMarkerClick);
					return marker;
				}
				// Create the marker and attach the 'click' event listener
				// Make sure handleMarkerClick is called only once.
				const marker = L.canvasMarker([Latitude, Longitude], {
					Id,
					radius: 20,
						img: {
							url: icon.options.iconUrl,
							size: [35, 35],
							rotate: 0,
							offset: {
								x: 0,
								y: 0
							},
						},
				}).on('click', once(handleMarkerClick));
				return marker;
			});
			return L.layerGroup(markers);
		};
		const initMap = async({
			latitude,
			longitude,
			zoom = 15
		}) => {
			try {
				map = L.map('map', {
					preferCanvas: true,
					zoomSnap,
					zoomDelta,
					zoomControl: false,
					wheelPxPerZoomLevel,
				}).setView([latitude, longitude], zoom);
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; OpenStreetMap contributors'
				}).addTo(map);

				await fetchAndUpdateLocations();
				
			} catch(error) {
				console.error('Error initializing map:', error);
			}
		};
		/** Navbar */
		const navbar_updatePointList = (newVisibleMarkerIDs) => {
			visibleMarkerIDs = newVisibleMarkerIDs.slice();
			markerList = newVisibleMarkerIDs.slice();
			let markedResult = document.getElementById('cargus-markedResult');
			if(markedResult) {
				markedResult.innerHTML = ``;
			}
			if(getLocationObject(pointerTracker.getPointerID())) {
				var markeditemData = getLocationObject(pointerTracker.getPointerID());
				const indexToRemove = markerList.findIndex(obj => obj.Id === pointerTracker.getPointerID());
				if(indexToRemove !== -1) {
					markerList.splice(indexToRemove, 1);
				}
				const {
					OpenHoursMoStart,
					OpenHoursMoEnd,
					OpenHoursTuStart,
					OpenHoursTuEnd,
					OpenHoursWeStart,
					OpenHoursWeEnd,
					OpenHoursThStart,
					OpenHoursThEnd,
					OpenHoursFrStart,
					OpenHoursFrEnd,
					OpenHoursSaStart,
					OpenHoursSaEnd,
					OpenHoursSuStart,
					OpenHoursSuEnd
				} = markeditemData;
				const schedule = {
					OpenHoursMoStart,
					OpenHoursMoEnd,
					OpenHoursTuStart,
					OpenHoursTuEnd,
					OpenHoursWeStart,
					OpenHoursWeEnd,
					OpenHoursThStart,
					OpenHoursThEnd,
					OpenHoursFrStart,
					OpenHoursFrEnd,
					OpenHoursSaStart,
					OpenHoursSaEnd,
					OpenHoursSuStart,
					OpenHoursSuEnd
				}
				const scheduleGenerator = new ScheduleGenerator(schedule);
				const formattedSchedule = scheduleGenerator.generateSchedule();
				let icon = `${assets_path}/spointpin.png`;
				const container = document.createElement('div');
				container.className = 'card extended-card';
				// Create the main div with icon, content, and image
				const mainDiv = document.createElement('div');
				mainDiv.className = 'main';
				const iconDiv = document.createElement('div');
				iconDiv.className = 'icon';
				const iconImage = document.createElement('img');
				iconImage.src = icon;
				iconImage.alt = 'Icon';
				iconDiv.appendChild(iconImage);
				const contentDiv = document.createElement('div');
				contentDiv.className = 'content';
				const titleParagraph = document.createElement('p');
				titleParagraph.className = 'title';
				titleParagraph.textContent = markeditemData.Name;
				const cityParagraph = document.createElement('p');
				cityParagraph.className = 'city';
				cityParagraph.textContent = markeditemData.City;
				const addressParagraph = document.createElement('p');
				addressParagraph.className = 'adress';
				addressParagraph.textContent = `${markeditemData.Address}`;
				const closingButton = document.createElement('span');
				closingButton.className = 'markedResultClosingButton';
				closingButton.textContent = `X`;
				closingButton.addEventListener('click', (event) => {
					event.preventDefault(); // Prevent the default behavior of the click event
					clearSearch();
					handleMarkerClick(markeditemData.Id);
					});
				contentDiv.appendChild(closingButton);
				contentDiv.appendChild(titleParagraph);
				contentDiv.appendChild(cityParagraph);
				contentDiv.appendChild(addressParagraph);
				const imageDiv = document.createElement('div');
				imageDiv.className = 'image';
				const image = document.createElement('img');
				image.src = markeditemData.MainPicture || `${assets_path}/cargus_logo.png`;
				image.alt = 'Pudo Point';
				imageDiv.appendChild(image);
				mainDiv.appendChild(iconDiv);
				mainDiv.appendChild(contentDiv);
				mainDiv.appendChild(imageDiv);
				const metaDataDiv = document.createElement('div');
				metaDataDiv.className = 'meta-data';
				const scheduleDiv = document.createElement('div');
				scheduleDiv.className = 'schedule';
				const daysSpan = document.createElement('span');
				daysSpan.className = 'days';
				daysSpan.innerHTML = formattedSchedule.replace(/\n/g, '<br>').replace(/Text/g, '<span style="font-family: YOUR_TEXT_FONT">Text</span>').replace(/\d{1,2}:\d{2} [APap][Mm]/g, '<span style="font-family: YOUR_HOURS_FONT">$&</span>');
				scheduleDiv.appendChild(daysSpan);
				// Create the card-payment div
				const cardPaymentDiv = document.createElement('div');
				cardPaymentDiv.className = 'card-payment';
				const AcceptedPayment = document.createElement('p');
				AcceptedPayment.textContent = 'Modalitati de plata:';
				AcceptedPayment.appendChild(document.createElement('br'));
				const acceptedPaymentSpan = document.createElement('span');
				acceptedPaymentSpan.className = 'accepted-payment';

				if( markeditemData.AcceptedPaymentType_cash || ( markeditemData.AcceptedPaymentType && markeditemData.AcceptedPaymentType.Cash ) ) {
					const cashImage = document.createElement('img');
					cashImage.src = `${assets_path}/cash_pay_icon.svg`;
					cashImage.alt = 'Numerar';
					acceptedPaymentSpan.appendChild(cashImage);
					acceptedPaymentSpan.appendChild(document.createTextNode(' Numerar'));
				} 
				
				if( markeditemData.AcceptedPaymentType_card || ( markeditemData.AcceptedPaymentType && markeditemData.AcceptedPaymentType.Card ) ) {
					const cardImage = document.createElement('img');
					cardImage.src = `${assets_path}/card_pay_icon.svg`;
					cardImage.alt = 'Card';
					acceptedPaymentSpan.appendChild(cardImage);
					acceptedPaymentSpan.appendChild(document.createTextNode(' Card'));
				}
				cardPaymentDiv.appendChild(AcceptedPayment);
				cardPaymentDiv.appendChild(acceptedPaymentSpan);
				const buttonsDiv = document.createElement('div');
				buttonsDiv.className = 'buttons';
				// Create the parent div for buttons
				const buttonsParentDiv = document.createElement('div');
				buttonsParentDiv.classList.add('text-buttons'); // Add the class 'buttons-parent'
				// Create the parent div for "Pinpoint" button
				const pinpointButtonDiv = document.createElement('div');
				pinpointButtonDiv.classList.add('pinpoint-button');

				pinpointButtonDiv.addEventListener('click', (event) => {
					event.preventDefault(); // Prevent the default behavior of the click event
					redirectToGoogleMaps(markeditemData.Latitude, markeditemData.Longitude);
					});	

				const resultContainer = document.getElementById('cargus-search-results-container');
				resultContainer.style.display = 'none';
				const listContainer = document.querySelector('.results');
				listContainer.style.filter = 'blur(0px)';
				const searchInput = mapWidgetContainer.querySelector('#cargus-search-box');
				searchInput.value = ''; // Clear the input value
				// Create the pinpoint icon element
				const pinpointIcon = document.createElement('img');
				pinpointIcon.src = `${assets_path}/icon-info-circle.svg`;
				// Create the text element
				const buttonText = document.createElement('span');
				buttonText.textContent = 'Vezi traseul';
				buttonText.classList.add('button-text');
				// Append the elements to the parent div
				pinpointButtonDiv.appendChild(pinpointIcon);
				pinpointButtonDiv.appendChild(buttonText);
				// Append the parent div to the buttonsParentDiv
				buttonsParentDiv.appendChild(pinpointButtonDiv);
				// Create the parent div for "Details" button
				const detailsButtonDiv = document.createElement('div');
				detailsButtonDiv.classList.add('details-button');
				const detailsIcon = document.createElement('img');
				detailsIcon.src = `${assets_path}/directions_icon.svg`;
				// Create the text element
				const detailsText = document.createElement('span');
				detailsText.textContent = 'Vezi detalii';
				detailsText.classList.add('button-text');
				// Append the elements to the parent div
				detailsButtonDiv.appendChild(detailsIcon);
				detailsButtonDiv.appendChild(detailsText);
				// Append the parent div to the buttonsParentDiv
				buttonsParentDiv.appendChild(detailsButtonDiv);
				// Append the parent div to the buttonsDiv (or any other parent element you have)
				buttonsDiv.appendChild(buttonsParentDiv);
				// Function to create the modal content
				function createModalContent({
					MainPicture,
					Address
				}) {
					const modalContent = document.createElement('div');
					const modalImage = document.createElement('img');
					modalImage.src = MainPicture || `${assets_path}/cargus_logo.png`;
					modalImage.classList.add('modal-image');
					const addressText = document.createTextNode(Address);
					const addressElement = document.createElement('p');
					addressElement.appendChild(addressText);
					addressElement.classList.add('modal-address');
					modalContent.appendChild(modalImage);
					modalContent.appendChild(addressElement);
					return modalContent;
				}

				function showDetails({
					MainPicture,
					Address
				}) {
					const modalContent = createModalContent({
						MainPicture,
						Address
					});
					const modal = document.createElement('div');
					modal.classList.add('modal', 'fade', 'cargus');
					modal.tabIndex = '-1';
					modal.role = 'dialog';
					// Create the modal dialog
					const modalDialog = document.createElement('div');
					modalDialog.classList.add('modal-dialog');
					const closeButton = document.createElement('span');
					closeButton.textContent = 'X';
					closeButton.classList.add('close-button');
					modalDialog.appendChild(closeButton);
					modalDialog.role = 'document';
					const modalContentWrapper = document.createElement('div');
					modalContentWrapper.classList.add('modal-content');
					const modal_image = document.createElement('img');
					modal_image.classList.add('modal-img');
					modalContentWrapper.appendChild(modalContent);
					modalDialog.appendChild(modal_image);
					modalDialog.appendChild(modalContentWrapper);
					modal.appendChild(modalDialog);
					document.body.appendChild(modal);
					closeButton.addEventListener('click', (event) => {
						event.preventDefault(); // Prevent the default behavior of the click event (usually form submission or link navigation)
						modal.style.display = 'none';
					});
				}
				detailsButtonDiv.addEventListener('click', (event) => {

					event.preventDefault();
					
					var {
						MainPicture,
						Address
					} = markeditemData;

					showDetails({ MainPicture, Address });

					});
					
				const choosePoint = document.createElement('button');
				choosePoint.classList.add('orange-button')
				choosePoint.textContent = 'Alege optiunea';
				choosePoint.onclick = (event) => {
					event.preventDefault();
					setTimeout(() => {
						ChooseMarker(markeditemData);
					}, 50);
					};
				buttonsDiv.appendChild(choosePoint);
				metaDataDiv.appendChild(scheduleDiv);
				metaDataDiv.appendChild(cardPaymentDiv);
				metaDataDiv.appendChild(buttonsDiv);
				container.appendChild(mainDiv);
				container.appendChild(metaDataDiv);
				markedResult.appendChild(container);
			}
			const markedResultExtendedCard = document.querySelector('#cargus-markedResult .extended-card');
			// Using library to create virtualized list for pudo points shown in sidebar.
			// Height need to be known before rendering, so we calculate it beforehand.
			var configHeight;
			configHeight = '95%';
			var config = {
				height: configHeight,
				itemHeight: 340,
				total: markerList.length,
				reverse: false,
				scrollerTagName: 'ul',
				rowClassName: 'MapContainer',
				generate(row) {
					var listItem = document.createElement('div');
					var itemData = markerList[row];
					var icon;
					if(itemData.PointType > 50) {
						const iconFilename = 'pointpin.png';
						icon = `${assets_path}/${iconFilename}`;
					} else {
						const iconFilename = 'lockerpin.png';
						icon = `${assets_path}/${iconFilename}`;
					}
					let background;
					const container = document.createElement('div');
					container.style.backgroundColor = background;
					container.className = 'card';
					container.onclick = () => handleMarkerClick(itemData.Id);
					// Create the icon div and image element
					const iconDiv = document.createElement('div');
					iconDiv.className = 'icon';
					const iconImage = document.createElement('img');
					iconImage.src = icon;
					iconImage.alt = 'Icon';
					iconDiv.appendChild(iconImage);
					const contentDiv = document.createElement('div');
					contentDiv.className = 'content';
					const titleParagraph = document.createElement('p');
					titleParagraph.className = 'title';
					titleParagraph.textContent = itemData.Name;
					const cityParagraph = document.createElement('p');
					cityParagraph.className = 'city';
					cityParagraph.textContent = itemData.City;
					const addressParagraph = document.createElement('p');
					addressParagraph.className = 'adress';
					addressParagraph.textContent = `${itemData.Address}`;
					contentDiv.appendChild(titleParagraph);
					contentDiv.appendChild(cityParagraph);
					contentDiv.appendChild(addressParagraph);
					const imageDiv = document.createElement('div');
					imageDiv.className = 'image';
					const image = document.createElement('img');
					image.src = itemData.MainPicture || `${assets_path}/cargus_logo.png`;
					image.alt = 'Pudo Point';
					imageDiv.appendChild(image);
					container.appendChild(iconDiv);
					container.appendChild(contentDiv);
					container.appendChild(imageDiv);
					listItem.appendChild(container);
					return {
						element: listItem,
						height: 160
					};
				}
			};
			if(list) {
				list.destroy();
			}
			var listContainer = document.getElementById('cargus-listContainer');
			if(listContainer) {
				list = HyperList.create(listContainer, config);
			}
			if(listContainer && visibleMarkerIDs.length > 0) {
				listContainer.style.display = 'block';
			} else if(listContainer) {
				listContainer.style.display = 'none';
			}
			handleMobileMenu();
		};
		var target = document.querySelector('#cargus-map-wrapper')
			// $('#cargus-map-wrapper').on('DOMSubtreeModified', function(){
			//     reactivity.apply();
			// })
		function showExtendedDetails() {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'btn btn-primary';
			button.setAttribute('data-toggle', 'modal');
			button.setAttribute('data-target', '#exampleModal');
			button.textContent = 'Launch demo modal';
			const modalDiv = document.createElement('div');
			modalDiv.className = 'cargus modal fade';
			modalDiv.id = 'exampleModal';
			modalDiv.tabIndex = '-1';
			modalDiv.role = 'dialog';
			modalDiv.setAttribute('aria-labelledby', 'exampleModalLabel');
			modalDiv.setAttribute('aria-hidden', 'true');
			const modalDialogDiv = document.createElement('div');
			modalDialogDiv.className = 'modal-dialog';
			modalDialogDiv.role = 'document';
			const modalContentDiv = document.createElement('div');
			modalContentDiv.className = 'modal-content';
			const modalHeaderDiv = document.createElement('div');
			modalHeaderDiv.className = 'modal-header';
			const modalTitle = document.createElement('h5');
			modalTitle.className = 'modal-title';
			modalTitle.id = 'exampleModalLabel';
			modalTitle.textContent = 'Modal title';
			modalHeaderDiv.appendChild(modalTitle);
			const closeButton = document.createElement('button');
			closeButton.type = 'button';
			closeButton.className = 'close';
			closeButton.setAttribute('data-dismiss', 'modal');
			closeButton.setAttribute('aria-label', 'Close');
			const closeSpan = document.createElement('span');
			closeSpan.setAttribute('aria-hidden', 'true');
			closeSpan.innerHTML = '&times;';
			closeButton.appendChild(closeSpan);
			modalHeaderDiv.appendChild(closeButton);
			// Create the modal body div
			const modalBodyDiv = document.createElement('div');
			modalBodyDiv.className = 'modal-body';
			modalBodyDiv.textContent = '...';
			const modalFooterDiv = document.createElement('div');
			modalFooterDiv.className = 'modal-footer';
			const closeButtonFooter = document.createElement('button');
			closeButtonFooter.type = 'button';
			closeButtonFooter.className = 'btn btn-secondary';
			closeButtonFooter.setAttribute('data-dismiss', 'modal');
			closeButtonFooter.textContent = 'Close';
			const saveButton = document.createElement('button');
			saveButton.type = 'button';
			saveButton.className = 'btn btn-primary';
			saveButton.textContent = 'Save changes';
			modalFooterDiv.appendChild(closeButtonFooter);
			modalFooterDiv.appendChild(saveButton);
			// Add the components to construct the modal
			modalContentDiv.appendChild(modalHeaderDiv);
			modalContentDiv.appendChild(modalBodyDiv);
			modalContentDiv.appendChild(modalFooterDiv);
			modalDialogDiv.appendChild(modalContentDiv);
			modalDiv.appendChild(modalDialogDiv);
			const parentElement = document.getElementById('your-parent-element-id');
			parentElement.appendChild(button);
			parentElement.appendChild(modalDiv);
			const tempContainer = document.createElement('div');
			tempContainer.innerHTML = modalContent;
			const modalElement = tempContainer.firstElementChild;
			document.body.appendChild(modalElement);
			$('#myModal').modal('show');
			$(modalElement).on('hidden.bs.modal', function() {
				document.body.removeChild(modalElement);
			});
		}

		function clearSearch() {
			const listContainer = document.querySelector('.results');
			if(listContainer) {
				listContainer.style.filter = 'blur(0px)';
				searchBox.value = '';
				clearButton.style.display = 'none';
				sidebar.style.height = '';
				setTimeout(() => {
					resultContainer.innerHTML = '';
				}, 50); // Delay clearing by 100 milliseconds
			}
			return false;
		}

		function renderSearchResults(results) {
			resultContainer.innerHTML = '';
			const listContainer = document.querySelector('.results');
			if(results.length === 0 && searchBox.value.length === 0) {
				listContainer.style.display = 'flex';
				searchBar.style.display = 'block';
				return;
			}
			if(results.length === 0) {
				resultContainer.innerHTML = '<p id="noresults"> Nu au fost găsite rezultate.</p>';
				return false;
			}
			results.forEach(result => {
				const resultItem = document.createElement('div');
				resultItem.style.backgroundColor = result.background;

				resultItem.addEventListener('click', (event) => {
					event.preventDefault(); // Prevent the default behavior of the click event (usually form submission or link navigation)
					handleMarkerClick(result.item.Id);
					});
					
				resultItem.classList.add('card');
				const iconDiv = document.createElement('div');
				iconDiv.classList.add('icon');
				const iconImg = document.createElement('img');
				const iconFilename = 'spointpin.png';
				iconImg.src = `${assets_path}/${iconFilename}`;
				iconImg.alt = 'Icon';
				iconDiv.appendChild(iconImg);
				// Create the content div
				const contentDiv = document.createElement('div');
				contentDiv.classList.add('content');
				// Create the title paragraph
				const titlePara = document.createElement('p');
				titlePara.classList.add('title');
				titlePara.textContent = result.item.Name;
				// Create the city paragraph
				const cityPara = document.createElement('p');
				cityPara.classList.add('city');
				cityPara.textContent = result.item.City;
				// Create the address paragraph
				const addressPara = document.createElement('p');
				addressPara.classList.add('address');
				addressPara.textContent = `${result.item.Address}`;
				contentDiv.appendChild(titlePara);
				contentDiv.appendChild(addressPara);
				const imageDiv = document.createElement('div');
				imageDiv.classList.add('image');
				resultItem.appendChild(iconDiv);
				resultItem.appendChild(contentDiv);
				resultItem.appendChild(imageDiv);
				resultContainer.appendChild(resultItem);
			});
		}

		function performSearch() {
			const searchTerm = searchBox.value.toLowerCase();
			const request = indexedDB.open(dbName);
			request.onsuccess = (event) => {
				const db = event.target.result;
				const transaction = db.transaction([objectStoreName], 'readonly');
				const objectStore = transaction.objectStore(objectStoreName);
				const storedData = [];
				objectStore.openCursor().onsuccess = (event) => {
					const cursor = event.target.result;
					if(cursor) {
						const location = cursor.value;
						storedData.push(location);
						cursor.continue();
					} else {
						const options = {
							keys: ['Name'],
							threshold: 0.3,
						};
						const fuse = new Fuse(storedData, options);
						const searchResults = fuse.search(searchTerm, {
							limit: 15
						});
						renderSearchResults(searchResults);
					}
				};
			};
			request.onerror = (event) => {
				console.error('Database error:', event.target.error);
			};
		}

		clearButton.addEventListener('click', (event) => {
		event.preventDefault(); // Prevent the default behavior of the click event (usually form submission or link navigation)
		clearSearch();
		});

		lockerCheckbox.addEventListener('change', (event) => {
			event.preventDefault(); // Prevent the default behavior of the change event (usually form submission or link navigation)
			updateMarkers();
		});

		shopCheckbox.addEventListener('change', (event) => {
		event.preventDefault(); // Prevent the default behavior of the change event (usually form submission or link navigation)
		updateMarkers();
		});

		const closeButton = document.getElementById('close-modal');
		searchBox.addEventListener('keydown', event => {
			if(event.key === 'Enter') {
				const resultContainer = document.getElementById('cargus-search-results-container');
				resultContainer.style.display = 'block';
				performSearch();
			}
		});
		searchBox.addEventListener('keydown', event => {
			if(event.key === 'Enter') {
				performSearch();
			}
		});
		searchBox.addEventListener('input', () => {
			if(searchBox.value.length > 0) {
				sidebar.style.height = '100%';
				const resultContainer = document.getElementById('cargus-search-results-container');
				const searchResultBox = document.querySelectorAll('.cargus-map-widget .search');
				resultContainer.style.display = 'block';
			} else {
				const resultContainer = document.getElementById('cargus-search-results-container');
				resultContainer.style.display = 'block';
				sidebar.style.height = '';
			}
			performSearch();
		});
		closeSearchBox.addEventListener('click', (event) => {
			event.preventDefault(); // Prevent the default behavior of the click event (usually form submission or link navigation)
			clearSearch();
			});
			
		if (closeButton) {
			closeButton.addEventListener('click', (event) => {
				event.preventDefault();
				setTimeout(() => {
				closeModal();
				}, 50);
			});
			}
	}
	window.initMapWidget = CargusMapWidget;
	return {
		initialize: CargusMapWidget
	}
};

