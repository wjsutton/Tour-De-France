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

# https://en.wikipedia.org/wiki/List_of_highest_points_reached_in_the_Tour_de_France
peak <- read.csv('data/highest_point_on_tour.csv',stringsAsFactors = F)
peak <- filter(peak,Elevation != '')

# Clean up elevation data
# extract numerical value
peak$Year <- as.double(peak$ï..Year)
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
led_2021 <- c(2021,13)
led_the_tour <- rbind(led_the_tour,led_2020,led_2021)

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
winners_df <- rbind(winners_df,c(2020,'Tadej Pogačar',2),c(2021,'Tadej Pogačar',13))
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
tooltip_df$tooltip <- case_when(tooltip_df$Metric == "winners_avg_speed" ~ paste0(tooltip_df$winner_name,' won the ',tooltip_df$year,' tour averaging a speed of ',round(tooltip_df$raw_value,1),'kph.'),
                                tooltip_df$Metric == "total_distance_in_km" ~ paste0(tooltip_df$year,"'s tour covered ",tooltip_df$raw_value,'km.'),
                                tooltip_df$Metric == "percent_abandons" ~ paste0(round(tooltip_df$raw_value*100,0),'% of riders abandoned the ',tooltip_df$year," tour leaving ",tooltip_df$Finishers,' riders at the finish.'),
                                tooltip_df$Metric == "highest_elevation_in_m" ~ paste0('The highest point of ',tooltip_df$year,"'s tour was ",tooltip_df$raw_value,'m at ',tooltip_df$Climb,', ',tooltip_df$Mountain.range,'.'),
                                tooltip_df$Metric == "led_percent" ~ ifelse(tooltip_df$stages_led == 1,paste0(tooltip_df$winner_name,' took the lead in the last stage of the race.'),paste0(tooltip_df$winner_name,' led the race for ',tooltip_df$stages_led,' stages out of ',tooltip_df$`Number of stages`,'.')))


# join tooltip back to main datasets
toughest_tour_df <- inner_join(toughest_tour_df,tooltip_df[,c('year','Metric','tooltip')],by = c('year' = 'year','Metric'='Metric'))

# write data to csv in utf8 encoding
write.csv(toughest_tour_df,'data/the_toughest_tour.csv',row.names = FALSE,fileEncoding = "UTF-8")

