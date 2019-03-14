queue()
    .defer(d3.csv, "assets/data/Ireland_population.csv", function (row) {
        return {
            country: row.Country,
            county: row.County_UD,
            ward: row.ED_Ward,
            tot_population: +row.TOTPOP,
            male_population: +row.MALE,
            female_population: +row.FEMALE,
            age_014: +row.AGE014T,
            age_1524: +row.AGE1524T,
            age_2544: +row.AGE2544T,
            age_4564: +row.AGE4564,
            age_65plus: +row.AEG65P
        };
    })
    .await(makeGraphs);
    function makeGraphs(error, data) {
        var ndx = crossfilter(data);
        show_country_chart(ndx);
        show_county_chart(ndx);
        show_stack_chart(ndx);
      
        dc.renderAll();
    }

/***********************************************  Sex Pie Chart */

function show_country_chart(ndx) {
    let countries_dim = ndx.dimension(dc.pluck('country'));
    let population = countries_dim.group().reduceSum(dc.pluck('tot_population'));

    dc.pieChart('#country_chart')
        .width(150)
        .height(150)
        .useViewBoxResizing(true)
        .transitionDuration(500)
        .dimension(countries_dim)
        .group(population)
        
        
}

function show_county_chart(ndx) {
    let county_dim = ndx.dimension(dc.pluck('county'));
    let population = county_dim.group().reduceSum(dc.pluck('tot_population'));

    dc.pieChart('#county_chart')
        .width(150)
        .height(150)
        .useViewBoxResizing(true)
        .transitionDuration(500)
        .dimension(county_dim)
        .group(population)
}

function show_stack_chart(ndx){
    let county_dim = ndx.dimension(dc.pluck('county'));
    let age_one = county_dim.group().reduceSum(dc.pluck('age_014'));
    let age_two = county_dim.group().reduceSum(dc.pluck('age_1524'));
    let age_three = county_dim.group().reduceSum(dc.pluck('age_2544'));
    let age_four = county_dim.group().reduceSum(dc.pluck('age_4564'));
    let age_five = county_dim.group().reduceSum(dc.pluck('age_65plus'));

    dc.barChart('#stack_chart')
    .width(1000)
    .height(350)
    .dimension(county_dim)
    .group(age_one,'0 to 14')
    .stack(age_two,'14 to 24')
    .stack(age_three,'25 to 44')
    .stack(age_four,'45 to 64')
    .stack(age_five,'64 plus')
    .transitionDuration(500)
    .x(d3.scale.ordinal())
    .margins({
        top: 30,
        left: 70,
        bottom: 70,
        right: 20
    })
    .legend(dc.legend().x(720).y(20).itemHeight(15).gap(5))
    .useViewBoxResizing(true)
    .xUnits(dc.units.ordinal)
    .elasticY(true)
    .xAxisLabel('Counties')
    .yAxisLabel('Population')
    .yAxis().ticks(7);
}
