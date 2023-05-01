
const allDropdown = document.querySelectorAll('#sidebar .side-dropdown');
const sidebar = document.getElementById('sidebar');

allDropdown.forEach(item=> {
	const a = item.parentElement.querySelector('a:first-child');
	a.addEventListener('click', function (e) {
		e.preventDefault();

		if(!this.classList.contains('active')) {
			allDropdown.forEach(i=> {
				const aLink = i.parentElement.querySelector('a:first-child');

				aLink.classList.remove('active');
				i.classList.remove('show');
			})
		}

		this.classList.toggle('active');
		item.classList.toggle('show');
	})
})
const toggleSidebar = document.querySelector('nav .toggle-sidebar');
const allSideDivider = document.querySelectorAll('#sidebar .divider');

if(sidebar.classList.contains('hide')) {
	allSideDivider.forEach(item=> {
		item.textContent = '-'
	})
	allDropdown.forEach(item=> {
		const a = item.parentElement.querySelector('a:first-child');
		a.classList.remove('active');
		item.classList.remove('show');
	})
} else {
	allSideDivider.forEach(item=> {
		item.textContent = item.dataset.text;
	})
}

toggleSidebar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');

	if(sidebar.classList.contains('hide')) {
		allSideDivider.forEach(item=> {
			item.textContent = '-'
		})

		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
	} else {
		allSideDivider.forEach(item=> {
			item.textContent = item.dataset.text;
		})
	}
})
sidebar.addEventListener('mouseleave', function () {
	if(this.classList.contains('hide')) {
		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
		allSideDivider.forEach(item=> {
			item.textContent = '-'
		})
	}
})
sidebar.addEventListener('mouseenter', function () {
	if(this.classList.contains('hide')) {
		allDropdown.forEach(item=> {
			const a = item.parentElement.querySelector('a:first-child');
			a.classList.remove('active');
			item.classList.remove('show');
		})
		allSideDivider.forEach(item=> {
			item.textContent = item.dataset.text;
		})
	}
})
const profile = document.querySelector('nav .profile');
const imgProfile = profile.querySelector('img');
const dropdownProfile = profile.querySelector('.profile-link');

imgProfile.addEventListener('click', function () {
	dropdownProfile.classList.toggle('show');
})

window.addEventListener('click', function (e) {
	if(e.target !== imgProfile) {
		if(e.target !== dropdownProfile) {
			if(dropdownProfile.classList.contains('show')) {
				dropdownProfile.classList.remove('show');
			}
		}
	}

	allMenu.forEach(item=> {
		const icon = item.querySelector('.icon');
		const menuLink = item.querySelector('.menu-link');

		if(e.target !== icon) {
			if(e.target !== menuLink) {
				if (menuLink.classList.contains('show')) {
					menuLink.classList.remove('show')
				}
			}
		}
	})
})




// ---------- CHARTS ----------


// BAR CHART
// Most Search Item

var searchChartOptions = {
    series: [{
      data: []
    }],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
    },
    colors: [
        "#d62828",
        "#f77f00",
        "#fcbf49"
    ],
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 4,
        horizontal: false,
        columnWidth: '40%',
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      title: {
        text: "Count"
      }
    }
  };
  
    searchChartOptions.xaxis.categories.splice(1,1)
    
  
  
  // AREA CHART
// Wishlisht and Reservation
  var areaChartOptions = {
    series: [{
      name: 'Wishlist',
      data: []
    }, {
      name: 'Reservation Orders',
      data: []
    }],
    chart: {
      height: 350,
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    colors: ["#4f35a1", "#246dec"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth'
    },
    labels: [],
    markers: {
      size: 0
    },
    yaxis: [
      {
        title: {
          text: 'Wishlist',
        },
      },
      {
        opposite: true,
        title: {
          text: 'Reservation Orders',
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
    }
  };
  

  // BAR CHART 2
// TOP 3 BEST SELLERS 
var bestChartOptions = {
    series: [{
      data: []
    }],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
    },
    colors: [
      "#6d597a",
       "#b56576", 
       "#e56b6f"
    ],
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 4,
        horizontal: false,
        columnWidth: '40%',
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      title: {
        text: "Count"
      }
    }
  };
  
  
   // BAR CHART 3
// TOP 3 MOST VIEWED PRODUCTS
var viewedChartOptions = {
    series: [{
      data: []
    }],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
    },
    colors: [
        "#8ecae6",
      "#219ebc",
      "#023047"
      
    ],
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 4,
        horizontal: false,
        columnWidth: '40%',
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      title: {
        text: "Count"
      }
    }
  };
  

var stats2 = document.getElementById("scriptValue").getAttribute("data-stats");
var r_stats = document.getElementById("scriptValue").getAttribute("reserveChart");
var w_stats = document.getElementById("scriptValue").getAttribute("wishlistChart");



JSON.parse(stats2).forEach( function (graph){
    if(graph.s_id != null){
        searchChartOptions.series[0].data.push(graph.search_rate)
        searchChartOptions.xaxis.categories.push(graph.item_name)
        if(graph.d_id != null){
            viewedChartOptions.series[0].data.push(graph.detail_rate)
            viewedChartOptions.xaxis.categories.push(graph.item_name)
            if(graph.u_id != null){
            bestChartOptions.series[0].data.push(graph.unique_rental)
            bestChartOptions.xaxis.categories.push(graph.item_name)
            }
        }
    }
    else if(graph.d_id != null){
        viewedChartOptions.series[0].data.push(graph.detail_rate)
        viewedChartOptions.xaxis.categories.push(graph.item_name)

        if(graph.u_id != null){
            bestChartOptions.series[0].data.push(graph.unique_rental)
            bestChartOptions.xaxis.categories.push(graph.item_name)
        }
    }
    else if(graph.u_id != null){
        bestChartOptions.series[0].data.push(graph.unique_rental)
        bestChartOptions.xaxis.categories.push(graph.item_name)
    }
})



//  var areaChartOptions = {
//    series: [{
//      name: 'Wishlist',
//      data: [31, 40, 28, 51, 42, 109, 100]
//    }, {
//      name: 'Reservation Orders',
//      data: [11, 32, 45, 32, 34, 52, 41]
//    }],
//
    //console.log(areaChartOptions.series[0].date) //Wishlist
    //console.log(areaChartOptions.series[1].date) //reservation
    //console.log(areaChartOptions.labels)


JSON.parse(r_stats).forEach( function(graph){
    if(graph.count != null && graph.r_month != null ){
        areaChartOptions.series[1].data.push(graph.count)
        areaChartOptions.labels.push(graph.r_month)
    }
    else{
        return
    }

})
JSON.parse(w_stats).forEach( function(graph){
    if(graph.count != null && graph.w_month != null ){
        areaChartOptions.series[0].data.push(graph.count)
        if(!areaChartOptions.labels.includes(graph.w_month)){
            areaChartOptions.labels.push(graph.w_month)
        }
    }
    else{
        return
    }

})
  var searchbarChart = new ApexCharts(document.querySelector("#bar-chart"), searchChartOptions);
  searchbarChart.render();
  var viewedbarChart = new ApexCharts(document.querySelector("#bar-chart3"), viewedChartOptions);
  viewedbarChart.render();
  var bestbarChart = new ApexCharts(document.querySelector("#bar-chart2"), bestChartOptions);
  bestbarChart.render();



  var areaChart = new ApexCharts(document.querySelector("#area-chart"), areaChartOptions);
  areaChart.render();
