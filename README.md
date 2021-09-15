<h1 style="font-weight:normal"> 
The Toughest Tour de France :bicyclist: :biking_woman: :biking_man:
</h1>

A data visualisation of cycling's toughest sporting competition.
<br>

[![Status](https://img.shields.io/badge/status-active-success.svg)]() [![GitHub Issues](https://img.shields.io/github/issues/wjsutton/Tour-De-France.svg)](https://github.com/wjsutton/Tour-De-France/issues) [![GitHub Pull Requests](https://img.shields.io/github/issues-pr/wjsutton/Tour-De-France.svg)](https://github.com/wjsutton/Tour-De-France/pulls) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)
[Twitter][Twitter] :speech_balloon:&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;[LinkedIn][LinkedIn] :necktie:&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;[GitHub :octocat:][GitHub]&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;[Website][Website] :link:

<!--/div-->

<!--
Quick Link 
-->

[Twitter]:https://twitter.com/WJSutton12
[LinkedIn]:https://www.linkedin.com/in/will-sutton-14711627/
[GitHub]:https://github.com/wjsutton
[Website]:https://wjsutton.github.io/

<table border="0">
 <tr>
    <td><b>:rocket: PROJECT</b></td>
    <td><b>:link: LINK</b></td>
 </tr>
 <tr>
    <td><a href="https://www.sportsvizsunday.com/post/weekly-round-up-07-18-2021">Sports Viz Sunday</a></td>
    <td><a href="https://public.tableau.com/app/profile/wjsutton/viz/TheToughestTour/TourdeFrance">Tableau Public</a></td>
 </tr>
 <tr>
    <td><b>:hammer_and_wrench: TOOLS</b></td>
    <td><b>:oil_drum: DATA</b></td>
 </tr>
 <tr>
    <td>R, <br>Tableau Public, <br>Figma</td>
    <td>Tour de France stage results, <br>highest elevation by tour, <br>and coxcomb from <a href="https://cj-mayes.com/2021/07/07/player-metrics/">CJ Mayes</a></td>
 </tr>
 <tr>
    <td><b>:trophy: AWARDS</b></td>
    <td><b>:newspaper: CITATIONS</b></td>
 </tr>
 <tr>
    <td><a href="https://public.tableau.com/en-us/gallery/toughest-tour-de-france?tab=viz-of-the-day&type=viz-of-the-day">Viz of the Day 2021-07-16</a><br><a href="https://public.tableau.com/app/profile/wjsutton/viz/TheToughestTour/TourdeFrance">100+ :star: on Tableau Public</a></td>
    <td><a href="https://www.linkedin.com/posts/tableau-software_tourdefrance-activity-6822903086168752128-bgbL">Tableau's LinkedIn</a><br><br></td>
 </tr>
</table>


### :a: About

The Tour de France is an annual men's multiple-stage bicycle race primarily held in France, while also occasionally passing through nearby countries. It consists of 21 stages, each a day-long, over 23 days around July.

The competition is incredibly tough and gruelling. Watching the 2021 tour got me thinking, which tour is the toughest? Using data available I derived **five factors of toughness** to the score the tours and **create this eye-catching and illustrative visualisation**.


<div style="overflow: hidden;margin: 0 10px 0 0">
<a href="https://public.tableau.com/app/profile/wjsutton/viz/TheToughestTour/TourdeFrance">
<img src='https://github.com/wjsutton/Tour-De-France/blob/master/Tour%20de%20France.png?raw=true' width="100%">
</a>
</div>

# :construction: UNDER CONSTRUCTION :construction:

<h1 style="font-weight:normal"> 
:hammer: Building the Visualisation
</h1>


### :oil_drum: Data Sources
- [Tour de France dataset](https://github.com/wjsutton/Tour-De-France/blob/master/data/tour_de_france.xlsx) source from [Kaggle/tour-de-france-winners](https://www.kaggle.com/jessemostipak/tour-de-france-winners?select=tdf_stages.csv), [Kaggle/tourdefrancedatase](https://www.kaggle.com/tylermorse/tourdefrancedatase), [TidyTuesday](https://github.com/rfordatascience/tidytuesday/tree/master/data/2020/2020-04-07)
- [Highest point on tour](https://github.com/wjsutton/Tour-De-France/blob/master/data/highest_point_on_tour.csv) from [Wikipedia/List_of_highest_points_reached_in_the_Tour_de_France](https://en.wikipedia.org/wiki/List_of_highest_points_reached_in_the_Tour_de_France)
- [Coxcomb padding](https://github.com/wjsutton/Tour-De-France/blob/master/data/coxcomb_padding.csv) from [CJ Mayes/player-metrics](https://cj-mayes.com/2021/07/07/player-metrics/)
- Updating any missing data with [letour.fr](https://www.letour.fr/en/history)


### :white_circle: Data Reshape

The data is read and reshaped using an [R script](https://github.com/wjsutton/Tour-De-France/blob/master/tdf.R), this script:
- reads data from all the data sources
- updates any missing figures up to 2021 with data from [letour.fr](https://www.letour.fr/en/history)
- cleans data sets (characters accents mainly)
- creates scaling factors for the 5 metrics to visualise in coxcomb chart from [CJ Mayes/player-metrics](https://cj-mayes.com/2021/07/07/player-metrics/)
- create tooltip string for Tableau

The output of this process is the dataset: [data/the_toughest_tour.csv](https://github.com/wjsutton/Tour-De-France/blob/master/data/the_toughest_tour.csv)

### :a: Visual Alphabet and Accessibility

<img src='https://raw.githubusercontent.com/wjsutton/Tour-De-France/master/screenshots/visual_alphabet.png' width="30%" align="right">

The visualisation aims to show five factors associated with each year's Tour de France, the factors are designed to line up with the race's jersey competition [tour-de-france-jerseys](https://www.bicycling.com/tour-de-france/a22091015/tour-de-france-jerseys/). 
- :yellow_square: Yellow Jersey -> Race Leader -> Level of competition (when was the lead decided)
- :orange_square: Polka Dot Jersey -> King of the Mountains -> Highest point on the tour
- :green_square: Green Jersey -> Leader in Sprinters Competition -> Average pace of the race winner
- :red_square: Combativity Award -> Number of riders that abandoned the race
- :blue_square: No Jersey -> Overall distance

<br><br>
Details of the Tour de France are unlikely to be well known to all the readers so several text elements were used to explain the sport and invite the readers to explore the data, to make the visual accessible for all. 

<div style="overflow: hidden;margin: 0 10px 0 0">
<img src='https://raw.githubusercontent.com/wjsutton/Tour-De-France/master/screenshots/accessibility.png' width="100%">
</div>

Colour hues were also checked and tested using [color-blindness.com/coblis-color-blindness-simulator/](https://www.color-blindness.com/coblis-color-blindness-simulator/), results as follows. In this case, readers can also distinguish between the factors by colour and the segment angle, so the viz can still be understood by a monochrome view but it is much easier if the colours are distinct too, in most cases this is true.

<div style="overflow: hidden;margin: 0 10px 0 0">
<img src="https://raw.githubusercontent.com/wjsutton/Tour-De-France/master/screenshots/colour_blindness_check.png" width="100%">
</div>

### :chart_with_upwards_trend: Charting in Tableau

This is a dashboard of two sheets:
- Coxcomb: the repeated coxcomb chart for each year the Tour de France was held
- tooltip: the hidden tooltip sheet called by Coxcomb on a hover over action, filter by Year and Metric

Coxcomb was created using the amazing tutorial and template from [CJ Mayes/player-metrics](https://cj-mayes.com/2021/07/07/player-metrics/) and replacing the background image for my own Figma version: [coxcomb_background_image](https://github.com/wjsutton/Tour-De-France/tree/master/figma/coxcomb_background_image.png) 

Tooltip is a list of all tooltips from the dataset: [data/the_toughest_tour.csv](https://github.com/wjsutton/Tour-De-France/blob/master/data/the_toughest_tour.csv) next to a square mark, coloured by the metric it represents. This sheet is then called in the tooltip of Coxcomb, filtering by Year & Metric, `filter="<Year>,<Metric>"`  

### :framed_picture: Figma Background

Many elements of this visualisation were created in Figma, including all the static text using the font: Open Sans

Images created in Figma can be found in [figma/](https://github.com/wjsutton/Tour-De-France/tree/master/figma), of note:
- [underlay](https://github.com/wjsutton/Tour-De-France/tree/master/figma/underlay.png) forms the lowest level of the dashboard with everything else floating on top of it 
- [coxcomb_background_image](https://github.com/wjsutton/Tour-De-France/tree/master/figma/coxcomb_background_image.png) is imported into Tableau as a background image for the Coxcomb sheet (X field: 5a.X, Left: -7.4, Right: 7.4 | Y field: 5a.Y, Bottom: -7.4, Top: 7.4)
- as [coxcomb_background_image](https://github.com/wjsutton/Tour-De-France/tree/master/figma/coxcomb_background_image.png) repeats even when there is no data available: [1903](https://github.com/wjsutton/Tour-De-France/tree/master/figma/1903.png), [2020s](https://github.com/wjsutton/Tour-De-France/tree/master/figma/2020.png), [WW1](https://github.com/wjsutton/Tour-De-France/tree/master/figma/WW1.png), [WW2](https://github.com/wjsutton/Tour-De-France/tree/master/figma/WW2.png) are floated at the top of the dashboard to hide empty wheels and provide some commentary on the data. 

--

<div style="overflow: hidden;margin: 0 10px 0 0">
<a href="https://public.tableau.com/app/profile/wjsutton/viz/TheToughestTour/TourdeFrance">
<img src='https://github.com/wjsutton/Tour-De-France/blob/master/Tour%20de%20France.png?raw=true' width="100%">
</a>
</div>
