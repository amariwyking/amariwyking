---
title: Comparing Classification Algorithms for Satellite Imagery
slug: comparing-classification-algorithms-for-satellite-imagery
date: 2025-02-28
category: Remote Sensing
description: After experimenting with different classification methods on satellite imagery of Milan, I wanted to share my findings on how CART, Random Forest, and K-means algorithms perform when identifying land cover types. Each approach showed distinct characteristics and limitations worth exploring.
---

![LANDSAT 8 RGB image of Northern Italy](/blog_photos/landsat-rgb-northern-italy.png)

## Overview

This analysis tested three classification algorithms on Landsat 8 imagery: Classification and Regression Tree (CART), Random Forest (RF), and K-means clustering. The objective was to classify the landscape into four categories: forest, developed areas, water, and herbaceous vegetation.

## Methodology

Using Google Earth Engine, I:

1. Selected a cloud-free Landsat 8 image of the Milan region
2. Created training data by manually identifying 25 points per class
3. Applied three classification algorithms using the same spectral bands
4. Compared classification results across methods

## Results

### CART Classification

The CART classifier demonstrated notable limitations:

- Frequently confused developed areas with herbaceous vegetation
- This confusion likely occurred because both urban spaces and certain agricultural fields appear as similar red, brown, and tan colors in the imagery, making spectral separation difficult
- Interestingly, it successfully identified dry water channels despite their lack of actual water content

### Random Forest Classification

The Random Forest algorithm performed significantly better:

- Reduced misclassification between herbaceous and developed land
- Created more coherent, less fragmented classification regions
- Was slightly less effective at identifying dry water channels than CART

I also tested increasing the number of trees from 50 to 500, which:

- Produced negligible improvement in classification accuracy
- Significantly increased computation time
- Offered poor return on computational investment—sometimes more isn't better

### K-means Clustering

The unsupervised K-means approach with 1,000 sampling points:

- Failed to effectively identify developed land areas
- Produced fewer false positives in water classification
- Consistently misclassified shaded forest on hillsides as water

When I increased to 50,000 sampling points:

- No substantial improvement in classification accuracy emerged
- New errors appeared—particularly confusing ocean water with herbaceous vegetation
- The algorithm consistently struggled to identify urban environments regardless of parameter adjustments

## Key Findings

1. Supervised classification methods clearly outperformed unsupervised approaches for this particular task
2. Random Forest delivered superior results compared to both CART and K-means
3. Increasing complexity parameters (tree count, sample size) yielded diminishing returns
4. Image selection affected results—cloud-free imagery selection favored drier seasons
5. Urban areas presented particular classification challenges due to spectral similarity with certain agricultural areas

## Next Steps

Future work will focus on:

- Adding spectral indices as input features to improve class separation
- Testing deep learning approaches for complex feature recognition
- Implementing seasonal time-series analysis to capture land cover changes

---
