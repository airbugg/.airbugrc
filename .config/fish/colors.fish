# colors
set pure_green \e\[32m

# color helpers
#
function danger_prompt 
    echo "$pure_color_danger$argv$pure_color_normal"
end

function info_prompt 
    echo "$pure_color_info$argv$pure_color_normal"
end

function success_prompt 
    echo $pure_green$argv$pure_color_normal
end
