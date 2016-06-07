<?php
//* Template Name: Events Landing Page

use Tower\Component\Events as Events;

// Remove Genesis Base
remove_action( 'genesis_entry_header', 'genesis_entry_header_markup_open', 5 );
remove_action( 'genesis_entry_header', 'genesis_do_post_title' );
remove_action( 'genesis_entry_header', 'genesis_entry_header_markup_close', 15 );
remove_action( 'genesis_entry_content', 'genesis_do_post_content' );
add_action('genesis_before_content', 'stauffers_banner' );
add_action( 'genesis_entry_content', 'stauffers_display_events' );

function stauffers_display_events()
{
    global $wpdb;

    $events = new Events();
    $posts = $events->get_events();
    $args = array( 'taxonomy' => 'tribe_events_cat' );
    $categories = get_categories($args);
    $dates = $events->get_dates();
    ?>
    <section class="single-event-section">
        <div data-st-select data-options="categories" data-label="name" data-select-label="Filter by Category" class="st-select-container"></div>
        <div data-st-select data-options="months" data-group-by="year" data-select-label="Filter by Month" class="st-select-container"></div>
        <div class="st-select-options-wrapper">
            <select class="filters st-select-container">
                <?php
                    foreach ($categories as $option) {
                        echo '<option class="category-option" value="' . $option->slug . '"data-param-key="cat_ids" data-param-value="' . $option->term_id . '">' . $option->name . '</option>';
                    }
                ?>
            </select>
            <select class="filters st-select-container">
                <?php
                    foreach ($dates as $option) {
                        $datetime = new DateTime( $option['timestamp'] );
                        echo '<option class="date-option" value="' . $option['label'] . '"data-param-key="dates" data-param-value="' .  $datetime->format('Y-m-d') . '">' . $option['label'] . '</option>';
                    }
                ?>
            </select>
        </div>

        <?php
        foreach ($posts as $event) {
            $title = get_the_title($event['post_id']);
            $thumbnail = get_field('event_image_thumbnail', $event['post_id']);
            $location_name = tribe_get_venue($event['post_id']);
            $location_address = tribe_get_address($event['post_id']);
            $start_time = tribe_get_start_date($event['post_id'], false, $format = 'g:i a' );
            $end_time = tribe_get_end_date($event['post_id'], false, $format = 'g:i a' );
            $start_date = tribe_get_start_date( $event['post_id'] );
            $end_date = tribe_get_start_date( $event['post_id'] );
            $permalink = get_the_permalink($event['post_id']);
            $excerpt = get_the_excerpt($event['post_id']);
            ?>
            <div class="single-event col-4">
                <div class="hover-tile-outer">
                    <div class="hover-tile-container">
                        <div class="hover-tile hover-tile-hidden">
                            <div class="calendar-container">
                                <div class="calendar-icon">
                                    <span class="calendar-plus-icon"><?php echo '<a href="'. $permalink .'?ical=1" target="_blank">Add Event to Calendar</a>'; ?></span>
                                </div>
                                <span>Add this event to your calendar or share this event with others!</span>
                            </div>
                            <ul class="sharing-container">
                                <li class="fab-icon facebook-icon"><?php echo '<a rel="external" target="_blank" sl-processed="1" href="https://www.facebook.com/sharer.php?u=' . $permalink . '">Share Event on Facebook</a>'; ?></li>
                                <li class="fab-icon twitter-icon"><?php echo '<a class="social tw" target="_blank" href="http://twitter.com/home?status=' . $permalink . '">Share Event on Twitter</a>'; ?></li>
                                <li class="fab-icon linkedin-icon"><?php echo '<a class="social li" href="https://www.linkedin.com/shareArticle?mini=true&url=' . $permalink . '&title=Stauffers ' . $title . '&source=Stauffers of Kissel Hill" target="_blank"">Share Event on LinkendIn</a>'; ?></li>
                                <li class="fab-icon email-icon"><?php echo '<a class="social email" href="mailto:?body=View Stauffers Event' . $title . ' here-' . $permalink . '">Email Event To</a>'; ?></li>
                            </ul>
                        </div>
                        <div class="hover-tile hover-tile-visible">
                            <div class="thumbnail-container">
                                <img src="<?php echo $thumbnail['url']; ?>" alt="<?php echo $thumbnail['alt']; ?>" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="meta-container">
                    <span class="header-bold"><?php echo $title; ?></span>
                    <strong><?php echo $start_date; ?></strong> -
                    <strong><?php echo $end_date; ?></strong><br />
                    <i><?php echo $start_time; ?> - <?php echo $end_time; ?></i><br />
                    <i><?php echo $location_name; ?></i><br />
                    <i><?php echo $location_address; ?></i><br />

                    <!-- <p ng-bind-html="event.excerpt"></p> -->
                    <!-- <a href="{{event.permalink}}">READ MORE</a> -->
                    <p><?php echo $excerpt; ?> <a href="<?php echo $permalink; ?>">[READ MORE]</a></p>
                </div>
            </div>
            <?php
        }
        ?>

    </section>
    <?php

    echo $events->do_pagination();
}

genesis();
