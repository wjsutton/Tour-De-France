# This scripts creates the data set:
# 'data/the_toughest_tour.csv'
# to be visualised in Tableau Public 

# Load libraries
library(dplyr)
library(readxl)
library(stringr)
library(tidyr)

# load datasets
winners <- read.csv('https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2020/2020-04-07/tdf_winners.csv',stringsAsFactors = F)

# https://www.kaggle.com/tylermorse/tourdefrancedataset
# 2017 onwards https://www.letour.fr/en/history
# for 2021 figure quoted here is 3414 https://www.letour.fr/en/rankings/stage-21
# 2021 history figure is 3383 - believe it is missing stage 20's 30.8km time trial
df <- readxl::read_excel('data/tour_de_france.xlsx', sheet = 'Sheet1')

# 2022 onwards from https://www.letour.fr/en/history and Wikipedia 'YYYY Tour de France'
# distance is as raced (letour.fr history shows the planned distance)
# speed is the official GC average (procyclingstats); 2025 & 2026 GC was neutralised on stage 21,
# so distance / time overstates it. 2026 is 43.326 (PCS) vs 43.227 (BBC/Tissot)
# stages_led = stages after which the winner held yellow
new_tours <- data.frame(
  Year = 2022:2026,
  speed = c(42.102, 41.413, 41.808, 42.849, 43.326),
  distance = c(3349.8, 3404, 3498, 3301.9, 3245),
  Finishers = c(135, 150, 141, 160, 158),
  Entrants = c(176, 176, 176, 184, 184),
  winner_name = c('Jonas Vingegaard','Jonas Vingegaard','Tadej Pogačar','Tadej Pogačar','Tadej Pogačar'),
  stages_led = c(11, 16, 19, 14, 17)
)
df <- bind_rows(df, transmute(new_tours, Year, `Winner's avg speed` = speed, `Total distance (km)` = distance,
                              `Number of stages` = 21, Finishers, Entrants, Winner = winner_name))

# https://en.wikipedia.org/wiki/List_of_highest_points_reached_in_the_Tour_de_France
peak <- read.csv('data/highest_point_on_tour.csv',stringsAsFactors = F,fileEncoding = 'UTF-8-BOM')
peak <- filter(peak,Elevation != '')

# Clean up elevation data
# extract numerical value
peak$Year <- as.double(peak$Year)
peak$highest_elevation_in_m <- str_extract(peak$Elevation,'(\\d|\\,)+')
peak$highest_elevation_in_m <- gsub(',','',peak$highest_elevation_in_m)
peak$highest_elevation_in_m <- as.double(peak$highest_elevation_in_m)

# replace characters
peak$Climb <-  gsub('Â|~|\\[\\w\\]','',peak$Climb)
peak$Climb <- gsub('Ã©','é',peak$Climb)
peak$Climb <- gsub('Ã¨','è',peak$Climb)
peak$Climb <- stringr::str_trim(peak$Climb, side = "right")
peak$Mountain.range <- gsub('Ã©','é',peak$Mountain.range)

# reduce to year and elevation
peak_df <- peak[,c('Year','highest_elevation_in_m')]

# xlsx has planned distances for some years (e.g. 1980, 1996), prefer as-raced from tidytuesday/Wikipedia
winners$Year <- as.double(substr(winners$start_date,1,4))
df$`Total distance (km)` <- coalesce(winners$distance[match(df$Year,winners$Year)], df$`Total distance (km)`)

# calculate abandons (number of riders who didn't finished the race)
df$total_abandons <- (df$Entrants - df$Finishers)
df$percent_abandons <- (df$Entrants - df$Finishers)/df$Entrants

# reduce dataset
summary <- df[,c('Year', "Winner's avg speed","Total distance (km)","percent_abandons")]

# In TdF winners find the number of stages they led the race for
winners$Year <- substr(winners$start_date,1,4)
winners$Year <- as.double(winners$Year)
led_the_tour <- winners[,c('Year','stages_led')]

# input data from https://www.letour.fr/en/history and append
led_2020 <- c(2020,2)
led_2021 <- c(2021,14)
led_the_tour <- rbind(led_the_tour,led_2020,led_2021,new_tours[,c('Year','stages_led')])

# calculate the percentage of the tour that was led, note not all tours had 23 stages
led_the_tour <- inner_join(led_the_tour,df[,c('Year','Number of stages')],by = c('Year' = 'Year'))
led_the_tour$led_percent <- (led_the_tour$stages_led -1) / (led_the_tour$`Number of stages`-1)
led_the_tour <- led_the_tour[,c('Year','led_percent')]

# Combine datasets together
toughest_df <- inner_join(summary,peak_df, by = c('Year' = 'Year'))
toughest_df <- inner_join(toughest_df,led_the_tour, by = c('Year' = 'Year'))

# Clean up column names
names(toughest_df) <- c('year','winners_avg_speed','total_distance_in_km','percent_abandons','highest_elevation_in_m','led_percent')

# Calculate the factors out of 100
out_of_100 <- toughest_df

out_of_100$winners_avg_speed <- (out_of_100$winners_avg_speed / max(out_of_100$winners_avg_speed))*100
out_of_100$total_distance_in_km <- (out_of_100$total_distance_in_km / max(out_of_100$total_distance_in_km))*100
out_of_100$percent_abandons <- (out_of_100$percent_abandons / max(out_of_100$percent_abandons))*100
out_of_100$highest_elevation_in_m <- (out_of_100$highest_elevation_in_m / max(out_of_100$highest_elevation_in_m))*100
out_of_100$led_percent <- 100 - (out_of_100$led_percent)*100

# Pivot the two datasets so we have the factor score and the actual value
out_of_100_pivot <- out_of_100 %>%
  pivot_longer(!year, names_to = "Metric", values_to = "Value")

toughest_df_pivot <- toughest_df %>%
  pivot_longer(!year, names_to = "Metric", values_to = "raw_value")

# merge to the two datasets
toughest_tour_df <- inner_join(out_of_100_pivot,toughest_df_pivot,by = c('year' = 'year','Metric' = 'Metric'))

# reduce and clean winners dataset
winners_df <- winners[,c('Year','winner_name','stages_led')]
names(winners_df) <- c('year','winner_name','stages_led')

# append data from https://www.letour.fr/en/history and clean up existing data
winners_df <- rbind(winners_df,c(2020,'Tadej Pogačar',2),c(2021,'Tadej Pogačar',14),
                    setNames(new_tours[,c('Year','winner_name','stages_led')],names(winners_df)))
winners_df$winner_name <- ifelse(winners_df$winner_name == 'Lance Armstrong','Lance Armstrong (Results voided)',winners_df$winner_name)
winners_df <- transform(winners_df, year = as.numeric(year))

# replace characters
winners_df$winner_name <- gsub('Ã¡','á',winners_df$winner_name)
winners_df$winner_name <- gsub('Ã©','é',winners_df$winner_name)
winners_df$winner_name <- gsub('Ã¨','è',winners_df$winner_name)
winners_df$winner_name <- gsub('Ã±','ñ',winners_df$winner_name)
winners_df$winner_name <- gsub('Ãƒâ€œ','Ó',winners_df$winner_name)
winners_df$winner_name <- gsub('ÃƒÂ¼','ü',winners_df$winner_name)
winners_df$winner_name <- gsub('ÃƒÂ§','ç',winners_df$winner_name)

# bring together datasets to write tooltips for tableau 
tooltip_df <- inner_join(toughest_tour_df,winners_df,by = c('year' = 'year'))
tooltip_df <- inner_join(tooltip_df,df[,c('Year','Finishers','Number of stages')],by = c('year' = 'Year'))
tooltip_df <- inner_join(tooltip_df,peak[,c('Year','Climb','Mountain.range')],by = c('year' = 'Year'))

# create tooltips as vectors
speed <- paste0(tooltip_df$winner_name,' won the ',tooltip_df$year,' tour averaging a speed of ',round(tooltip_df$raw_value,1),'kph.')
dist <- paste0(tooltip_df$year,"'s tour covered ",tooltip_df$raw_value,'km.')
abandons <- paste0(round(tooltip_df$raw_value*100,0),'% of riders abandoned the ',tooltip_df$year," tour leaving ",tooltip_df$Finishers,' riders at the finish.')
height <- paste0('The highest point of ',tooltip_df$year,"'s tour was ",tooltip_df$raw_value,'m at ',tooltip_df$Climb,', ',tooltip_df$Mountain.range)
led <- paste0(tooltip_df$winner_name,' led the race for ',tooltip_df$stages_led,' stages out of ',tooltip_df$`Number of stages`,'.')

# add tooltip to dataset via case when
tooltip_df$tooltip <- case_when(tooltip_df$Metric == "winners_avg_speed" ~ paste0(tooltip_df$winner_name,' won the ',tooltip_df$year,' tour averaging a speed of ',sprintf('%.1f',tooltip_df$raw_value + 1e-9),'kph.'), # ponytail: +1e-9 so 29.05 rounds up to 29.1
                                tooltip_df$Metric == "total_distance_in_km" ~ paste0(tooltip_df$year,"'s tour covered ",tooltip_df$raw_value,'km.'),
                                tooltip_df$Metric == "percent_abandons" ~ paste0(round(tooltip_df$raw_value*100,0),'% of riders abandoned the ',tooltip_df$year," tour leaving ",tooltip_df$Finishers,' riders at the finish.'),
                                tooltip_df$Metric == "highest_elevation_in_m" ~ paste0('The highest point of ',tooltip_df$year,"'s tour was ",tooltip_df$raw_value,'m at ',tooltip_df$Climb,', ',tooltip_df$Mountain.range,'.'),
                                tooltip_df$Metric == "led_percent" ~ ifelse(tooltip_df$stages_led == 1,paste0(tooltip_df$winner_name,' took the lead in the last stage of the race.'),paste0(tooltip_df$winner_name,' led the race for ',tooltip_df$stages_led,' stages out of ',tooltip_df$`Number of stages`,'.')))


# join tooltip back to main datasets
toughest_tour_df <- inner_join(toughest_tour_df,tooltip_df[,c('year','Metric','tooltip')],by = c('year' = 'year','Metric'='Metric'))

# write data to csv in utf8 encoding
write.csv(toughest_tour_df,'data/the_toughest_tour.csv',row.names = FALSE,fileEncoding = "UTF-8")


# Coxcomb geometry for Tableau map layers: data/coxcomb.geojson
# layer = 'segment' (one wedge per year & metric), 'ring' (tyre around each wheel), 'label' (decade headers)
# ring is data driven, so years with no tour get no empty wheel
# wheel units match the old background image (-7.4 to 7.4), wedge radius = Value/100*5.4 + 0.27
# ponytail: hand-written GeoJSON, switch to sf if geometry gets more complex
deg <- 0.01                                  # degrees per wheel unit, small so web mercator distortion is negligible
col_w <- 15.69; row_h <- 14.83               # cell spacing in wheel units (matches the dashboard grid)
metric_order <- c('winners_avg_speed','total_distance_in_km','percent_abandons','led_percent','highest_elevation_in_m')
ring_bands <- list(c('tyre',6.198,5.846),c('rim',5.846,5.698),c('rim_edge',5.698,5.661))

lonlat <- function(year, x, y) {
  sprintf('[%.5f,%.5f]', deg*((year %/% 10 - 190)*col_w + x), deg*(-(year %% 10)*row_h + y))
}
coords <- function(year, x, y) paste0('[', paste(lonlat(year, x, y), collapse = ','), ']')
arc <- function(r, from, to, n) { t <- seq(from, to, length.out = n); list(x = r*cos(t), y = -r*sin(t)) } # y flipped so wedges run clockwise
feature <- function(props, geom) {
  p <- paste(sprintf('"%s":%s', names(props), sapply(props, function(v) if (is.numeric(v)) format(v) else paste0('"', gsub('"','\\\\"',v), '"'))), collapse = ',')
  sprintf('{"type":"Feature","properties":{%s},"geometry":%s}', p, geom)
}

features <- c()
for (i in seq_len(nrow(toughest_tour_df))) {
  d <- toughest_tour_df[i,]
  k <- match(d$Metric, metric_order)
  a <- arc(d$Value/100*5.4 + 0.27, (k-4.75)*2*pi/5, (k-3.75)*2*pi/5, 100) # abandons (pink) centred at 12 o clock
  geom <- sprintf('{"type":"Polygon","coordinates":[%s]}', coords(d$year, c(0,a$x,0), c(0,a$y,0)))
  features <- c(features, feature(list(layer='segment', year=d$year, Metric=d$Metric, Value=d$Value, raw_value=d$raw_value, tooltip=d$tooltip), geom))
}
for (y in unique(toughest_tour_df$year)) for (b in ring_bands) {
  outer <- arc(as.numeric(b[2]), 0, 2*pi, 121); inner <- arc(as.numeric(b[3]), 2*pi, 0, 121)
  geom <- sprintf('{"type":"Polygon","coordinates":[%s,%s]}', coords(y, outer$x, outer$y), coords(y, inner$x, inner$y))
  features <- c(features, feature(list(layer='ring', year=y, ring_part=b[1]), geom))
}
for (decade in seq(1900, 2020, 10)) {
  geom <- sprintf('{"type":"Point","coordinates":%s}', lonlat(decade, 0, row_h*0.7))
  features <- c(features, feature(list(layer='label', label=paste0(decade,'s')), geom))
}
# corners pin the map extent to the 900x670 Coxcomb zone (13 columns fill the width, bottom row flush with the bottom)
# ponytail: 4 invisible points, Tableau fits to them so the wheels land where the underlay arrows expect
sheet_w <- 13*col_w; sheet_h <- sheet_w*670/900
x0 <- -col_w/2; y0 <- -9.5*row_h
for (cn in list(c('bottom_left',x0,y0),c('bottom_right',x0+sheet_w,y0),c('top_left',x0,y0+sheet_h),c('top_right',x0+sheet_w,y0+sheet_h))) {
  geom <- sprintf('{"type":"Point","coordinates":%s}', lonlat(1900, as.numeric(cn[2]), as.numeric(cn[3])))
  features <- c(features, feature(list(layer='corner', corner=cn[1]), geom))
}
writeLines(sprintf('{"type":"FeatureCollection","features":[\n%s\n]}', paste(features, collapse = ',\n')), 'data/coxcomb.geojson', useBytes = TRUE)
