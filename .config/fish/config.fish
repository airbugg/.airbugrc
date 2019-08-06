
# fnm
set PATH $HOME/.fnm $PATH
fnm env --multi | source

# load utils
source $HOME/.config/fish/colors.fish

# load dir spies
source $HOME/.config/fish/functions/fnm_on_cd.fish
source $HOME/.config/fish/functions/npm_registry_on_cd.fish

# use brew's ruby
set -g fish_user_paths (/usr/local/opt/ruby/bin/ruby -r rubygems -e 'puts Gem.user_dir')/bin $fish_user_paths
set -g fish_user_paths "/usr/local/opt/ruby/bin" $fish_user_paths
set -g fish_user_paths "/usr/local/sbin" $fish_user_paths

# make sure z doesn't fall into a pothole
if type -q z
    z -c > /dev/null
end

# functions
#
function cleandsstores
    find . -name '.DS_Store' -exec rm -f '{}' ';'
end


