queue()
    .defer(d3.csv, "assets/data/Ireland_population.csv", function (row) {
        return {
            country: row.Country,
            county: row.County_UD,
            ward: row.ED_Ward,
            tot_population: +row.TOTPOP,
            male_population: +row.MALE,
            female_population: + row.FEMALE,
            age_014: + row.AGE014T,
            age_1524: +row.AGE1524T,
            age_2544: +row.AGE2544T,
            age_4564: +row.AGE4564,
            age_65plus: +row.AEG65P
        };
    })
    .await(makeGraphs);
    function makeGraphs(error, data) {
        var ndx = crossfilter(data);
        // show_country_selector(ndx);
        // show_year_selector(ndx);
        // show_line_graph(ndx);
        show_bar_chart(ndx);
        // show_scatterplot(ndx);
        // show_sex_chart(ndx);
        // show_age_chart(ndx);
        // show_population_info(ndx);
    
        dc.renderAll();
    
        // console.log(data);
    }
    
function show_bar_chart(ndx) {
    var counties = ndx.dimension(dc.pluck('county'));
    var totalPopulation = counties.group().reduceSum(dc.pluck('tot_population'));

    dc.barChart('#bar_chart')
        .width(800)
        .height(350)
        .dimension(counties)
        .group(totalPopulation)
        .transitionDuration(500)
        // .colors(d3.scale.ordinal().range(colors))
        .x(d3.scale.ordinal())
        .margins({
            top: 30,
            left: 70,
            bottom: 70,
            right: 20
        })
        .useViewBoxResizing(true)
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel('Year')
        .yAxisLabel('Life expectancy (years)')
        .yAxis().ticks(7);
}