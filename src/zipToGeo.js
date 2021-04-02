import { csvParse } from 'd3'

const zipTable = enqueueCSV('./assets/zip_lat-long.csv')

const baseData = enqueueCSV('./assets/2020_zipcodes.csv')

const fillerData = enqueueCSV('./assets/filler_data.csv')
    .then(data => {
        return data.map(d => {
            return { // construct a geoJSON feature
                type: "Feature",
                properties: {
                    zipcode: undefined,
                    numPeople: 0,
                },
                geometry: {
                    type: "Point",
                    coordinates: [d.longitude, d.latitude]
                }
            }
        })
})

const talliedBaseData = baseData.then(data => {
    const lowercaseData = objKeysToLowercase(data) // handle case that user uploads a CSV with title case column headers
    const flatZips = lowercaseData.map(d => d.zipcode) // extract zipcodes into flat Array
    const unique = flatZips.filter(isDistinct) // extract unique values
        .map(d => {
            return { // construct new item with zip and number of occurrances of zip in data
                zipcode: d,
                numPeople: flatZips.filter(item => item === d).length
            }
        })

    return unique
})

// Making filler data available by itself
export const fillerGeoData = Promise.all([zipTable, fillerData]).then(([zip2geo, filler]) => {
    return { // construct geoJSON FeatureCollection, essentially a big table merge
        "type":"FeatureCollection",
        "features": [...filler]
    }   
})

// Making report data available by itself
export const reportGeoData = Promise.all([zipTable, baseData])
    .then(([zip2geo, zipcodes]) => {
        return { // construct geoJSON FeatureCollection, essentially a big table merge
            "type":"FeatureCollection",
            "features": [...zipcodes.map(z => {
                    let item = zip2geo.find(geo => geo.zip == z.zipcode)

                    if (!item) return

                    return {
                        type: "Feature",
                        properties: {
                            zipcode: z.zipcode,
                            numPeople: z.numPeople,
                        },
                        geometry: {
                            type: "Point",
                            coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)]
                        }
                    }
                }).filter(item => !!item),
            ]
        }   
})

// Merged filler and report data
export const mergedGeoData = Promise.all([zipTable, talliedBaseData, fillerData])
    .then(([zip2geo, zipcodes, filler]) => {
        return { // construct geoJSON FeatureCollection, essentially a big table merge
            "type":"FeatureCollection",
            "features": [...zipcodes.map(z => {
                let item = zip2geo.find(geo => geo.zip == z.zipcode)

                if (!item) return

                return {
                    type: "Feature",
                    properties: {
                        zipcode: z.zipcode,
                        numPeople: z.numPeople,
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)]
                    }
                }
            }).filter(item => !!item),
            ...filler]
        }    
})

function enqueueCSV(csv) {
    return fetch(csv)
        .then(res => {
            return res.ok ? res.text() : Promise.reject(res.status);
        }).then(text => csvParse(text))
}

function isDistinct(val, index, arr) { return arr.indexOf(val) === index }

function objKeysToLowercase(obj) {
    const newObj = {}
    return Object.keys(obj).map(key => newObj[key.toLowerCase()] = obj[key])
}