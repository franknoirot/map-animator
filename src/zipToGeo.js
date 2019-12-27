import { csvParse } from 'd3'

export const zipTable = fetch('./assets/zip_lat-long.csv')
    .then(res => {
        return res.ok ? res.text() : Promise.reject(res.status);
    }).then(text => csvParse(text))

export const baseData = fetch('./assets/base_zipcodes.csv')
    .then(res => {
        return res.ok ? res.text() : Promise.reject(res.status);
    }).then(text => csvParse(text))

export const fillerData = fetch('./assets/filler_data.csv')
    .then(res => {
        return res.ok ? res.text() : Promise.reject(res.status);
    }).then(text => csvParse(text))
    .then(data => {
        return data.map(d => {
            return {
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

export const talliedBaseData = baseData.then(data => {
    const flatZips = data.map(d => d.zipcode)
    const unique = flatZips.filter(isDistinct)
        .map(d => {
            return {
                zipcode: d,
                numPeople: flatZips.filter(item => item === d).length
            }
        })

    return unique
})

export const geoBaseData = Promise.all([zipTable, talliedBaseData, fillerData]).then(([zip2geo, zipcodes, filler]) => {
    return {
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

function isDistinct(val, index, arr) { return arr.indexOf(val) === index }