<h1 style="font-weight:normal"> 
The Toughest Tour de France :bicyclist: :biking_woman: :biking_man:
</h1>

A data visualisation of cycling's toughest sporting competition.
<br>

[![Status](https://img.shields.io/badge/status-active-success.svg)]() [![GitHub Issues](https://img.shields.io/github/issues/wjsutton/Tour-De-France.svg)](https://github.com/wjsutton/Tour-De-France/issues) [![GitHub Pull Requests](https://img.shields.io/github/issues-pr/wjsutton/Tour-De-France.svg)](https://github.com/wjsutton/Tour-De-France/pulls) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

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
    <td><a href="https://public.tableau.com/en-us/gallery/toughest-tour-de-france?tab=viz-of-the-day&type=viz-of-the-day">Viz of the Day 2021-07-16</a></td>
    <td><a href="https://www.linkedin.com/posts/tableau-software_tourdefrance-activity-6822903086168752128-bgbL">Tableau's LinkedIn</a></td>
 </tr>
</table>


### :a: About

The Tour de France is an annual men's multiple-stage bicycle race primarily held in France, while also occasionally passing through nearby countries. It consists of 21 stages, each a day long, over the course of 23 days around July.

The competition is an incredibly tough and gruelling, and from watching the 2021 tour it got me thinking, which tour is the toughest? Using data available I derived **five factors of toughness** to the score the tours and **create this eye-catching and illustrative visualisation**.


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

The data is read and reshaped using an [R script](https://github.com/wjsutton/Tour-De-France/blob/master/tdf.R)

### :a: Visual Alphabet

The aim of the visualisation is show five factors associated with each year's Tour de France, the factors are designed to line up with the race's jersey competition [tour-de-france-jerseys](https://www.bicycling.com/tour-de-france/a22091015/tour-de-france-jerseys/). 
- :yellow_square: Yellow Jersey -> Race Leader -> Level of competition (when was the lead decided)
- :orange_square: Polka Dot Jersey -> King of the Mountains -> Highest point on the tour
- :green_square: Green Jersey -> Leader in Sprinters Competition -> Average pace of the race winner
- :red_square: Combativity Award -> Number of riders that abandoned the race
- :blue_square: No Jersey -> Overall distance

### :chart_with_upwards_trend: Charting in Tableau

### :framed_picture: Figma Background

[Twitter][Twitter] :speech_balloon:&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;[LinkedIn][LinkedIn] :necktie:&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;[GitHub :octocat:][GitHub]&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;[Website][Website] :link:

<!--/div-->

<!--
Quick Link 
-->

[Twitter]:https://twitter.com/WJSutton12
[LinkedIn]:https://www.linkedin.com/in/will-sutton-14711627/
[GitHub]:https://github.com/wjsutton
[Website]:https://wjsutton.github.io/


