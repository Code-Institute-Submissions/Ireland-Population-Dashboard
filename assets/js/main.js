/* 
    1.  Calling data from CSV file
    2.  Drawing all graphs
    3.  Orientation alert
    4.  Color array
    5.  Country Pie Chart
    6.  County Pie Chart
    7.  Age groups Stack Chart
    8.  Density Bar Chart
    9.  Population number displays
    10. Selectors
    11. Scroll effect
*/





/***********************************************  Calling data from CSV file ********************************/

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
/***********************************************  Drawing all graphs ********************************/

function makeGraphs(error, data) {
    show_float_buttons();
    orientation_info();
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

/***********************************************  Orientation alert ********************************/

function orientation_info() {
    "use strict";
    if (window.matchMedia("(orientation: portrait)").matches) {
        alert('Please use landscape mode for better experience ');
     }
};

/***********************************************  Color array ********************************/

let colors = ['#24A9E1','#A2DEF2', '#6BC5E7','#94C5E6','#2A7DC1','#8D94E8','#5E9FD5','#4E52AD','#1A75BB','#6E70D0','#3A3D9C','#6EDCD3','#0DADA5','#C7EC8D','#B5DF73','#8CC43F','#9AE5A1','#6ED07D','#3AB34A','#82D9AE','#64BF93','#2A8E5F','#016738','#FFE605','#FDD60C','#FEC50B','#F4C899','#F5B063','#F8962E','#FCB30F','#F68B17','#F56423','#F499A0','#F88A90','#F0535C','#EF2A33','#EC909B','#E16879','#D3505E','#C93847','#EC909B','#E27683','#D3505E','#C42C39','#EFAAD7','#E585C4','#DD5FB0','#D3389D','#B58FD8','#9C73C2','#5B2789','#C4996C','#A07955','#866444','#62432C','#3B2317','#CECED0','#A7A7A7','#6E6C6D','#3A3839'];

/***********************************************  Country Pie Chart ********************************/


function show_country_chart(ndx) {
    let countries_dim = ndx.dimension(dc.pluck('country'));
    let population = countries_dim.group().reduceSum(dc.pluck('tot_population'));

    dc.pieChart('#country_chart')
        .width(150)
        .height(150)
        .colors(d3.scale.ordinal().range(colors))
        .useViewBoxResizing(true)
        .transitionDuration(500)
        .dimension(countries_dim)
        .group(population)


}
/***********************************************  County Pie Chart ********************************/

function show_county_chart(ndx) {
    let county_dim = ndx.dimension(dc.pluck('county'));
    let population = county_dim.group().reduceSum(dc.pluck('tot_population'));

    dc.pieChart('#county_chart')
        .width(150)
        .height(150)
        .colors(d3.scale.ordinal().range(colors))
        .useViewBoxResizing(true)
        .transitionDuration(500)
        .dimension(county_dim)
        .group(population)
}
/*********************************************** Age groups Stack Chart ********************************/

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
        .colors(d3.scale.ordinal().range(['#f9ed69','#FEC50B','#f08a5d','#b83b5e','#6a2c70']))
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
            bottom: 100,
            right: 20
        })
        .legend(dc.legend().x(920).y(5).itemHeight(15).gap(5))
        .useViewBoxResizing(true)
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel('County')
        .yAxisLabel('Population')
        .yAxis().ticks(9);
}

/*********************************************** Density Bar Chart ********************************/

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
        .colors(d3.scale.ordinal().range(colors))
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
            bottom: 100,
            right: 20
        })
        .useViewBoxResizing(true)
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel('County')
        .yAxisLabel('Density')
        .yAxis().ticks(9);
}

/***********************************************  Population number displays ********************************/


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
/***********************************************  Selectors ********************************/

function show_selectors(ndx) {
    let country_dim = ndx.dimension(dc.pluck('country'));
    let country_group = country_dim.group();
    dc.selectMenu('#country_selector')
        .dimension(country_dim)
        .group(country_group)
        .title(function (d) {
            return d.key;
        })
        .promptText("Select Country");

    let county_dim = ndx.dimension(dc.pluck('county'));
    let county_group = county_dim.group();
    dc.selectMenu('#county_selector')
        .dimension(county_dim)
        .group(county_group)
        .title(function (d) {
            return d.key;
        })
        .promptText("Select County");
}
/***********************************************  Scroll effect ********************************/


function show_float_buttons(){
    $(window).scroll(function () {
			if ($(window).scrollTop() > 400) {
				$('.float_btn').addClass('visible');
			} else {
				$('.float_btn').removeClass('visible');
			}
	});
}