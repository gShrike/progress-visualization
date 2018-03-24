import numpy as np
import pandas as pd

from bokeh.plotting import figure, show, output_file

def format_data(students):
    data = dict(categories=[], maximums=[], minimums=[], q1_scores=[], q2_scores=[], q3_scores=[])
    total_intervals = 100/len(students['intervals'])
    for i, interval in enumerate(students['intervals']):
        data['categories'].append(str(int(total_intervals * (i + 1))) + '%')
        data['maximums'].append(interval['q3'] + 1.5*interval['iqr'])
        data['minimums'].append(interval['q1'] - 1.5*interval['iqr'])
        data['q1_scores'].append(interval['median'] - interval['iqr'])
        data['q2_scores'].append(interval['median'])
        data['q3_scores'].append(interval['median'] + interval['iqr'])
    return data

def draw(students):
    data = format_data(students) 

    p = figure(tools="save", background_fill_color="#F4F3FB", title="Student Assessment Progress", x_range=data['categories'])
    
    # stems
    p.segment(data['categories'], data['maximums'], data['categories'], data['q3_scores'], line_color="black")
    p.segment(data['categories'], data['minimums'], data['categories'], data['q1_scores'], line_color="black")
    
    # boxes
    p.vbar(data['categories'], 0.7, data['q2_scores'], data['q3_scores'], fill_color="#BE69CA", line_color="black")
    p.vbar(data['categories'], 0.7, data['q1_scores'], data['q2_scores'], fill_color="#40977F", line_color="black")
    
    # whiskers (almost-0 height rects simpler than segments)
    p.rect(data['categories'], data['minimums'], 0.2, 0.01, line_color="black")
    p.rect(data['categories'], data['maximums'], 0.2, 0.01, line_color="black")
    
    p.xgrid.grid_line_color = None
    p.ygrid.grid_line_color = "white"
    p.grid.grid_line_width = 2
    p.xaxis.major_label_text_font_size="8pt"
    
    #  output_file("boxplot.html", title="boxplot.py example")
    #
    #  show(p)
