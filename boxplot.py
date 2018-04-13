import numpy as np
import pandas as pd

from bokeh.io import curdoc
from bokeh.plotting import figure
from bokeh.resources import CDN
from bokeh.embed import file_html
from bokeh.layouts import column, widgetbox
from bokeh.models import ColumnDataSource, HoverTool
from bokeh.models.widgets import DataTable, TableColumn, Panel, Tabs

from constants import PROGRESS_INTERVALS, DISPLAY_PERCENTAGE

background_color = '#F4F3FB'
top_quartile_color = '#BE69CA'
bottom_quartile_color = '#40977F'
highlight_color = '#5373F5'
second_highlight_color = '#2DE0FF'
third_highlight_color = '#FF0054'
fourth_highlight_color = '#FF822D'
line_color = 'black'

line_width = 6

def format_data(students):
    data = dict(categories=[], maximums=[], minimums=[], q1_scores=[], q2_scores=[], q3_scores=[], scatter_x=[], scatter_y=[], percentage=[])
    student_total_intervals = DISPLAY_PERCENTAGE/len(students['intervals'])
    for i, interval in enumerate(students['intervals']):
        student_percentage = int(student_total_intervals * (i + 1))
        category = str(student_percentage)
        data['percentage'].append(student_percentage)
        data['categories'].append(category)
        if interval['median'] is not 0:
            data['q1_scores'].append(interval['q1'])
            data['q2_scores'].append(interval['median'])
            data['q3_scores'].append(interval['q3'])
            data['maximums'].append(interval['max'])
            data['minimums'].append(interval['min'])
        for assessment_count in interval['completed_assessments']:
            data['scatter_x'].append(category)
            data['scatter_y'].append(assessment_count)
    return data

def get_student_data(student):
    return list(map(lambda interval: len(interval['assessments']), student['progress']))

def generate_figure(categories):
    hover = HoverTool(tooltips=[ ('Standards: ', '$y'), ])
    tools = ['pan', 'box_zoom', 'reset', 'save', hover]
    new_figure = figure(tools=tools, background_fill_color=background_color, title='Student Assessment Progress', x_range=categories, width=1000)
    new_figure.xgrid.grid_line_color = None
    new_figure.ygrid.grid_line_color = 'white'
    new_figure.grid.grid_line_width = 2
    new_figure.xaxis.major_label_text_font_size='8pt'
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

def add_lines(plot, student, school, addProgress):
    plot.line(student['program'], student['best_fit_line'], line_width=line_width, color=second_highlight_color, legend='Student Best Fit')
    plot.line(school['program'], school['best_fit_line'], line_width=line_width, color=third_highlight_color, legend='School Best Fit')
    if addProgress:
        plot.line(student['program_to_date'], student['data'], line_width=line_width, color=highlight_color, legend='Student Progress')

    plot.legend.location = 'top_left'
    plot.legend.click_policy = 'hide'

def get_line_information(data, students, name):
    student = dict()
    school = dict()
    
    student['data'] = get_student_data(students[name])
    student['program'] = data['categories']
    student['program_to_date'] = data['categories'][:len(student['data'])]
    student['progress'] = data['percentage'][:len(student['data'])]
    
    school['program'] = data['categories'][:len(data['percentage'])]
    school['progress'] = data['percentage'][:len(data['q2_scores'])]
    
    student['polynomial'] = np.polyfit(student['progress'], student['data'], 1)
    school['polynomial'] = np.polyfit(school['progress'], data['q2_scores'], 1)

    student['best_fit_line'] = np.poly1d(student['polynomial'])(data['percentage'])
    school['best_fit_line'] = np.poly1d(school['polynomial'])(data['percentage'])

    return student, school

def generate_extended_boxplot(data, student, school):
    extended_categories = list(data['percentage'])
    for i in range(10):
        extended_categories.append(int(PROGRESS_INTERVALS * (i + 1) + DISPLAY_PERCENTAGE))
    student['progress'] = list(map(lambda x: str(x), extended_categories))
    extended_boxplot = generate_figure(student['progress'])
    generate_boxplot(extended_boxplot, data)

    student['best_fit_line'] = np.poly1d(student['polynomial'])(extended_categories)
    student['program'] = student['progress']
    add_lines(extended_boxplot, student, school, False)

    return extended_boxplot

def draw(students, name):
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
        TableColumn(field='progress', title='Progress'),
        TableColumn(field='standards', title='Median Standards')
    ]

    tab1 = Panel(child=boxplot, title='Boxplot')
    tab2 = Panel(child=scatterplot, title='Scatterplot')

    tabs = [tab1, tab2]

    # draw student line
    if name and name in students:
        student, school = get_line_information(data, students, name)

        add_lines(boxplot, student, school, True)
        add_lines(scatterplot, student, school, True)

        table_data['student_standards'] = student['data']
        columns.append(TableColumn(field='student_standards', title='Student Standards'))

        extended_boxplot = generate_extended_boxplot(data, student, school)
        tab3 = Panel(child=extended_boxplot, title='Extension')
        tabs.append(tab3)


    source = ColumnDataSource(table_data)
    data_table = DataTable(source=source, columns=columns, width=400, height=280)
    inputs = widgetbox(data_table)

    tabs = Tabs(tabs=tabs)

    curdoc().clear()
    curdoc().add_root(column(tabs, inputs, width=2000))

    return file_html(curdoc(), CDN, 'student assessment progress')
