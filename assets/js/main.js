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
        show_country_chart(ndx);
      
        dc.renderAll();
    }

/***********************************************  Sex Pie Chart */

function show_country_chart(ndx) {
    var sex_category = ndx.dimension(dc.pluck('country'));
    var totalSex = sex_category.group().reduceSum(dc.pluck('tot_population'));

    dc.pieChart('#country_chart')
        .width(150)
        .height(150)
        .useViewBoxResizing(true)
        .transitionDuration(500)
        .dimension(sex_category)
        .group(totalSex)
        
        
}
