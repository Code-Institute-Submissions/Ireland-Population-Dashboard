queue()
    .defer(d3.csv, "assets/data/Ireland_population.csv", function (row) {
        return {
            country: row.Country,
            county: row.County_UD,
            ward: row.ED_Ward,
            tot_population: +row.TOTPOP,
            male_population: +row.MALE,
            female_population: +row.FEMALE,
            density: +row.POPDENKM,
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
    show_bar_chart(ndx);
    show_total_display(ndx);
    show_male_display(ndx);
    show_female_display(ndx);
    show_selectors(ndx);

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

function show_stack_chart(ndx) {
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
        .group(age_one, '0 to 14')
        .stack(age_two, '14 to 24')
        .stack(age_three, '25 to 44')
        .stack(age_four, '45 to 64')
        .stack(age_five, '64 plus')
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

function show_bar_chart(ndx) {
    let county_dim = ndx.dimension(dc.pluck('county'));
    let average_density = county_dim.group().reduce(
        function (p, v) {
            p.count++;
            p.total += v.density;
            p.average = p.total / p.count;
            return p;
        },
        function (p, v) {
            p.cunt--;
            if (p.count == 0) {
                p.total = 0;
                p.average = 0;
            } else {
                p.total -= v.density;
                p.average = p.total / p.count;
            }
            return p;
        },
        function () {
            return {
                count: 0,
                total: 0,
                average: 0
            };
        }
    );


    dc.barChart('#bar_chart')
        .width(1000)
        .height(350)
        .dimension(county_dim)
        .group(average_density)
        .valueAccessor(function (d) {
            return d.value.average
        })
        .transitionDuration(500)
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
        .xAxisLabel('Counties')
        .yAxisLabel('Density')
        .yAxis().ticks(7);
}

function show_total_display(ndx) {
    let population = ndx.groupAll().reduce(
        function (p, v) {
            if (v.tot_population > 0) {
                p.total += v.tot_population;
            }

            return p;
        },
        function (p, v) {
            if (v.tot_population > 0) {
                p.total -= v.tot_population;
            }

            return p;
        },
        function () {
            return {
                total: 0
            };
        }
    );

    dc.numberDisplay("#total")
        .group(population)
        .transitionDuration(500)
        .formatNumber(d3.format(",f"))
        .valueAccessor(function (d) {
            return d.total;
        });


}

function show_male_display(ndx) {
    let male = ndx.groupAll().reduce(
        function (p, v) {
            if (v.male_population > 0) {
                p.total += v.male_population;
            }

            return p;
        },
        function (p, v) {
            if (v.tot_population > 0) {
                p.total -= v.male_population;
            }

            return p;
        },
        function () {
            return {
                total: 0
            };
        }
    );
    dc.numberDisplay("#male")
    .group(male)
    .transitionDuration(500)
    .formatNumber(d3.format(",f"))
    .valueAccessor(function (d) {
        return d.total;
    });
}
function show_female_display(ndx) {
    let female = ndx.groupAll().reduce(
        function (p, v) {
            if (v.male_population > 0) {
                p.total += v.female_population;
            }

            return p;
        },
        function (p, v) {
            if (v.tot_population > 0) {
                p.total -= v.female_population;
            }

            return p;
        },
        function () {
            return {
                total: 0
            };
        }
    );
    dc.numberDisplay("#female")
    .group(female)
    .transitionDuration(500)
    .formatNumber(d3.format(",f"))
    .valueAccessor(function (d) {
        return d.total;
    });
}
function show_selectors(ndx){
/****************************************** Country Selector */
    let country_dim = ndx.dimension(dc.pluck('country'));
    let country_group = country_dim.group();
    dc.selectMenu('#country_selector')
    .dimension(country_dim)
    .group(country_group)
    .title(function (d) {
        return d.key;
    })
    .promptText("Choose a Country");

    let county_dim = ndx.dimension(dc.pluck('county'));
    let county_group = county_dim.group();
    dc.selectMenu('#county_selector')
    .dimension(county_dim)
    .group(county_group)
    .title(function (d) {
        return d.key;
    })
    .promptText("Choose a County");
}
function scroll(){
    AOS.init();
    $('#down_btn').on('click', function(e) {
        $('html, body').animate({
            scrollTop: $(window).height()
        }, 1200);
    });
}