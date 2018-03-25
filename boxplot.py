import numpy as np
import pandas as pd

from bokeh.io import curdoc
from bokeh.plotting import figure
from bokeh.resources import CDN
from bokeh.embed import file_html
from bokeh.layouts import column, widgetbox
from bokeh.models import ColumnDataSource, HoverTool
from bokeh.models.widgets import DataTable, TableColumn, Panel, Tabs

background_color = '#F4F3FB'
top_quartile_color = '#BE69CA'
bottom_quartile_color = '#40977F'
highlight_color = '#FF822D'
line_color = 'black'

def format_data(students):
    data = dict(categories=[], maximums=[], minimums=[], q1_scores=[], q2_scores=[], q3_scores=[], scatter_x=[], scatter_y=[])
    total_intervals = 100/len(students['intervals'])
    for i, interval in enumerate(students['intervals']):
        category = str(int(total_intervals * (i + 1))) + '%'
        data['categories'].append(category)
        if interval['median'] is not 0:
            data['q1_scores'].append(interval['q1'])
            data['q2_scores'].append(interval['median'])
            data['q3_scores'].append(interval['q3'])
            data['maximums'].append(interval['max'])
            data['minimums'].append(interval['min'])
        # Whisker at 1.5 IQR - Disabled
        #  whisker_max = interval['q3'] + 1.5*interval['iqr']
        #  whisker_min = interval['q1'] - 1.5*interval['iqr']
        #  whisker_min = whisker_min if whisker_min > 0 else 0
        #  data['maximums'].append(interval['max'] if interval['max'] > whisker_max else whisker_max)
        #  data['minimums'].append(interval['min'] if interval['min'] < whisker_min else whisker_min)
        for assessment_count in interval['completed_assessments']:
            data['scatter_x'].append(category)
            data['scatter_y'].append(assessment_count)
    return data

def get_student_data(student):
    return list(map(lambda interval: len(interval['assessments']), student['progress']))

def generate_figure(categories):
    new_figure = figure(tools=["save"], background_fill_color=background_color, title="Student Assessment Progress", x_range=categories)
    new_figure.xgrid.grid_line_color = None
    new_figure.ygrid.grid_line_color = "white"
    new_figure.grid.grid_line_width = 2
    new_figure.xaxis.major_label_text_font_size="8pt"
    new_figure.xaxis.axis_label = '% Program'
    new_figure.yaxis.axis_label = '# Standards Completed'
    return new_figure

def generate_boxplot(boxplot, data):
    # stems
    boxplot.segment(data['categories'], data['maximums'], data['categories'], data['q3_scores'], line_color=line_color)
    boxplot.segment(data['categories'], data['minimums'], data['categories'], data['q1_scores'], line_color=line_color)
    
    # boxes
    boxplot.vbar(data['categories'], 0.7, data['q2_scores'], data['q3_scores'], fill_color=top_quartile_color, line_color=line_color)
    boxplot.vbar(data['categories'], 0.7, data['q1_scores'], data['q2_scores'], fill_color=bottom_quartile_color, line_color=line_color)
    
    # whiskers (almost-0 height rects simpler than segments)
    boxplot.rect(data['categories'], data['minimums'], 0.2, 0.01, line_color=line_color)
    boxplot.rect(data['categories'], data['maximums'], 0.2, 0.01, line_color=line_color)
    return boxplot

def generate_scatterplot(scatterplot, data):
    scatterplot.circle(data['scatter_x'], data['scatter_y'], size=10, color=top_quartile_color, alpha=0.5)
    return scatterplot

def draw(students, student):
    data = format_data(students) 

    boxplot = generate_figure(data['categories'])
    generate_boxplot(boxplot, data)

    scatterplot = generate_figure(data['categories'])
    generate_scatterplot(scatterplot, data)
    
    table_data = dict(
        progress=data['categories'],
        standards=data['q2_scores'],
    )
    columns = [
        TableColumn(field="progress", title="Progress"),
        TableColumn(field="standards", title="Median Standards")
    ]

    # draw student line
    if student and student in students:
        student_data = get_student_data(students[student])
        program_progress = data['categories'][:len(student_data)]
        scatterplot.line(program_progress, student_data, color=highlight_color)
        boxplot.line(program_progress, student_data, color=highlight_color)
        table_data['student_standards'] = student_data
        columns.append(TableColumn(field="student_standards", title="Student Standards"))

    source = ColumnDataSource(table_data)
    data_table = DataTable(source=source, columns=columns, width=400, height=280)
    inputs = widgetbox(data_table)

    tab1 = Panel(child=boxplot, title="Boxplot")
    tab2 = Panel(child=scatterplot, title="Scatterplot")

    tabs = Tabs(tabs=[ tab1, tab2 ])

    curdoc().clear()
    curdoc().add_root(column(tabs, inputs, width=1000))

    return file_html(curdoc(), CDN, "student assessment progress")
