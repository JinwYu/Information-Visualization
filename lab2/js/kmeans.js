    /**
    * k means algorithm
    * @param data = The data.
    * @param k = The number of clusters.
    * @return {Object} = Returns the clustered data.
    */  
    
    var N_KEYS;	// Number of keys in the data set.    
    var K;  // Nr of clusters.

    function kmeans(data, k) {
        
        // Symbolizes the cluster quality.
    	var newClusterQuality = 0;
    	var previousClusterQuality = Infinity;    	

    	// Get the number of keys in the data set.
	    N_KEYS = Object.keys(data[0]).length;
	    K = k;

	    // Counter to count the nr of iterations of the loop.
	    var nrLoopIterations = 0;

	    // STEP 1:
	    // Generate the first centroids.    
    	var centroids = generateRandomCentroids(data);

    	// Repeat steps 2-4, which improves the clusters, until
    	// the cluster quality no longer is improving.
    	while(newClusterQuality < previousClusterQuality) {
    		
    		// Save the previous cluster quality value if it's not the first iteration.
    		if(nrLoopIterations > 1) { previousClusterQuality = newClusterQuality; }

	        // STEP 2:	     
	        // Assign each item to the cluster that has the closest centroid.   
	        var clusteredData = assignItemsToClusters(data, centroids);

	        // STEP 3:
	        // Recalculate the positions of the centroids to be in the
			// centre of the cluster. 
	        centroids = updateCentroidPositions(data, centroids, clusteredData);

	        // STEP 4:
	        // Calculate the quality of the cluster.
	        newClusterQuality = calculateClusterQuality(data, centroids, clusteredData);

	        // Iterate nr of iterations and print it out.
	        nrLoopIterations++;
	        console.log("Iteration nr: " + nrLoopIterations + 
	         "             (Still improving the clusters.)");
	    }

	    console.log("______________________________________________________________");
	    console.log("The cluster quality is no longer improving, breaking the loop.");
	    
	    // Return the clustered data to be drawn in the parallel plot.    
	    return clusteredData;
	};
    
	/**
    * STEP 1.
	* Randomly place K points into the space represented 
	* by the items that are being clustered. These points 
	* represent the initial cluster centroids.
	*
    * @param  data = The data.
    * @return tempCentroids = The randomly chosen centroids.
    */  
	function generateRandomCentroids(data){
		var tempCentroids = [];

        for(var i = 0; i < K; i++) {
			tempCentroids.push( data[ Math.floor( Math.random()*data.length ) ] );
        }
        return tempCentroids;
    }


    /**
	* STEP 2:
    * Assign each item to the cluster that has the 
    * closest centroid. To calculate the distances, 
    * Euclidean distance is being used here. 
    *
    * @param  data = The data.
    * @param  centroids = The centroids.
    * @return tempClusteredData = Returns the clustered data.
    */  
    function assignItemsToClusters(data, centroids){

    	var tempClusteredData = [];
    	var q = [];	// Positions in the data set.
		var p = []; // Centroids.
		var tempDistance;
        var indexCluster = 0; // Cluster index to be saved.

        // Loop through all of the items in the data set.
        for(var idx = 0; idx < data.length; idx++){

        	var minDistance = Infinity;
        	// Convert the array to the correct format.
        	q = convertArray(data[idx]);
        	
        	// Assign the items to the nearest cluster.
        	for(var idu = 0; idu < K; idu++){

        		p = convertArray(centroids[idu]);
        		tempDistance = 0;

        		// Calculate the Euclidean distance by first summing up
        		// then calculating the square root of the sum.
        		for(var idv = 0; idv < N_KEYS; idv++){
        			// Squared.
        			tempDistance += Math.pow(q[idv] - p[idv],2);
        		}

        		tempDistance = Math.sqrt(tempDistance);

        		// Swap the distances and save the index.
        		if(tempDistance < minDistance){
        			minDistance = tempDistance;
        			indexCluster = idu;
        		}
        	}

        	tempClusteredData.push(indexCluster);
        }

        return tempClusteredData;
    }


    /**
	* STEP 3:
    * Recalculate the positions of the centroids to 
    * be in the centre of the cluster. This is achieved 
    * by calculating the average values in all dimensions.
    *
    * @param  data = The data.
    * @param  centroids = The centroids.
    * @param  clusteredData = The clustered data.
    * @return centroids = The recalculated centroids.
    */  
    function updateCentroidPositions(data, centroids, clusteredData){

    	var dataValues = [];
        var averages = [];
        var nrItems;

        // For each cluster.
        for(var idx = 0; idx < K; idx++){
        	
        	// For every dimension.
        	for(var idu = 0; idu < N_KEYS; idu++){ 

        		// Used to calculate the average.
        		var sum = 0;
        		nrItems = 0;

        		// For every item.
        		for(var idv = 0; idv < data.length; idv++){ 

        			// Convert the array to the correct format.
        			dataValues = convertArray(data[idv]);

        			// Sum the values in every dimension.
        			if(clusteredData[idv] == idx){
        				sum += dataValues[idu];
        				nrItems++;
        			}
        		}

        		// Calculate the average value and add it to the array.
        		var anAverageValue = sum/nrItems;
        		averages.push(anAverageValue);

        	}

        	// Update the centroids with the
        	// average values in all dimensions.
        	centroids[idx] = averages;

        	// Resetting these is necessary.
        	averages = [];
        	dataValues = [];

        }

        return centroids;
    }


    /**
	* STEP 4:
    * Check the quality of the cluster. Uses the sum of 
    * the squared distances within each cluster as the
    * measure of quality. The objective with this lab 
    * is to minimize the sum of squared errors within 
    * each cluster.
    *
    * @param  data = The data.
    * @param  centroids = The centroids.
    * @param  clusteredData = The clustered data.
    * @return sumOfSquaredErrors = The new cluster quality value.
    */  
    function calculateClusterQuality(data, centroids, clusteredData){

    	var x = [];
		var mu = [];
        var sumOfSquaredErrors = 0;	// This is the new cluster value.

        // For each cluster.
        for(var idx = 0; idx < K; idx++){

        	// "mu" is the centroid (mean of the points).
        	mu = convertArray(centroids[idx]);

        	// For each key/dimension.
        	for(var idu = 0; idu < N_KEYS; idu++){

        		// For each item.
        		for(var idv = 0; idv < data.length; idv++){

        			// "x" represents each cluster.
        			x = convertArray(data[idv]);

        			// Calculating the new cluster quality
        			if(clusteredData[idv] == idx){
        				// Squared.
        				sumOfSquaredErrors += Math.pow(x[idu] - mu[idu],2);
        			}
        		}
        	}
        }

        return sumOfSquaredErrors;
	}


	/**
	* Converts an array to a one dimensional array.
    *
    * @param  data = The data.
    * @return convertedArray = The converted array.
    */  
	function convertArray(data){
		var convertedArray = [];
		for(var idx in data){  convertedArray.push(Number(data[idx]));  }
	    return convertedArray;
	}