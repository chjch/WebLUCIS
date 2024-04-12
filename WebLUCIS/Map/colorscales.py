import plotly.express as px
import json

# This gets a dictionary of continuous color scales
color_scales = px.colors.named_colorscales()

# Now, let's prepare this data in a format that can be easily used in JavaScript
color_scales_data = {}
for scale in color_scales:
    # Getting the actual color scale list for each named scale
    colors_list = px.colors.get_colorscale(scale)
    color_scales_data[scale] = colors_list

# Saving this data to a JSON file
with open('plotly_color_scales.json', 'w') as f:
    json.dump(color_scales_data, f)